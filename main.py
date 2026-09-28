from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import PatientProfile, VitalReading, Symptoms

from database import (
    save_patient_profile,
    get_patient_profile,
    save_vital_reading,
    get_latest_vitals,
    save_symptoms,
    get_latest_symptoms,
    save_chat_message,
    save_alert,
    save_risk_result,
    risk_results
)

from emergency_rule import check_emergency
from riskmodel import RiskClassifier
from chatbot import ChatbotEngine


app = FastAPI(
    title="MATERNAL_ASTRA - Maternal Health Risk Assessment",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# OBJECTS
# =====================================================

risk_classifier = RiskClassifier()
chatbot_engine = ChatbotEngine()

active_connections = {}


# =====================================================
# CHAT MODELS
# =====================================================

class ChatRequest(BaseModel):
    patient_id: str
    message: str


class ChatResponse(BaseModel):
    response: str
    risk_level: Optional[str] = None
    recommendation: Optional[str] = None


# =====================================================
# HOME
# =====================================================

@app.get("/")
async def home():

    return {
        "status": "online",
        "service": "MATERNAL_ASTRA backend",
        "docs": "/docs"
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/api/health")
async def health_check():

    return {
        "status": "online",
        "message": "MATERNAL_ASTRA backend is running"
    }


# =====================================================
# WEBSOCKET
# =====================================================

@app.websocket("/ws/{patient_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    patient_id: str
):

    await websocket.accept()

    active_connections[patient_id] = websocket

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        active_connections.pop(patient_id, None)


# =====================================================
# CREATE PATIENT
# =====================================================

@app.post("/api/patient")
async def create_patient(profile: PatientProfile):

    patient_data = profile.dict()

    save_patient_profile(patient_data)

    return {
        "status": "success",
        "message": "Patient profile saved",
        "patient_id": profile.patient_id
    }


# =====================================================
# SAVE VITALS
# =====================================================

@app.post("/api/vitals")
async def save_vitals(reading: VitalReading):

    reading_data = reading.dict()

    save_vital_reading(reading_data)


    # ---------------------------------------------
    # Get symptoms
    # ---------------------------------------------

    symptoms = get_latest_symptoms(
        reading.patient_id
    ) or {}


    # ---------------------------------------------
    # Emergency check
    # ---------------------------------------------

    is_emergency, severity, reason = check_emergency(
        reading_data,
        symptoms
    )


    # ---------------------------------------------
    # Emergency alert
    # ---------------------------------------------

    if is_emergency:

        alert = {
            "patient_id": reading.patient_id,
            "severity": severity,
            "reason": reason,
            "timestamp": datetime.utcnow(),
            "status": "NEW"
        }

        save_alert(alert)


        # Send emergency to connected frontend

        if reading.patient_id in active_connections:

            await active_connections[
                reading.patient_id
            ].send_json({

                "type": "EMERGENCY_ALERT",

                "severity": severity,

                "reason": reason

            })


    # ---------------------------------------------
    # Send LIVE VITALS to frontend
    # ---------------------------------------------

    if reading.patient_id in active_connections:

        await active_connections[
            reading.patient_id
        ].send_json({

            "type": "VITAL_UPDATE",

            "vitals": reading_data

        })


    return {

        "status": "success",

        "message": "Vitals received from ESP32",

        "patient_id": reading.patient_id,

        "is_emergency": is_emergency,

        "severity": severity,

        "reason": reason

    }


# =====================================================
# SYMPTOMS
# =====================================================

@app.post("/api/symptoms")
async def update_symptoms(symptoms: Symptoms):

    symptom_data = symptoms.dict()

    symptom_data["timestamp"] = datetime.utcnow()

    save_symptoms(symptom_data)

    return {

        "status": "success",

        "message": "Symptoms saved"

    }


# =====================================================
# CHAT
# =====================================================

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    patient_profile = get_patient_profile(
        request.patient_id
    )


    if not patient_profile:

        raise HTTPException(
            status_code=404,
            detail="Patient not found. Please complete the patient profile first."
        )


    vitals = get_latest_vitals(
        request.patient_id
    ) or {}


    symptoms = get_latest_symptoms(
        request.patient_id
    ) or {}


    # ---------------------------------------------
    # Emergency
    # ---------------------------------------------

    is_emergency, severity, emergency_reason = check_emergency(
        vitals,
        symptoms
    )


    # ---------------------------------------------
    # Risk input
    # ---------------------------------------------

    risk_input = {

        **vitals,

        **symptoms,

        "age":
            patient_profile.get("age", 0),

        "gestational_week":
            patient_profile.get(
                "gestational_week",
                0
            )

    }


    risk_level, score, reasons = (
        risk_classifier.calculate_risk_score(
            risk_input
        )
    )


    if is_emergency:

        risk_level = severity

        if (
            emergency_reason
            and emergency_reason not in reasons
        ):

            reasons.append(
                emergency_reason
            )


    recommendation = (
        risk_classifier.get_recommendation(
            risk_level
        )
    )


    # ---------------------------------------------
    # Save risk
    # ---------------------------------------------

    risk_result = {

        "patient_id":
            request.patient_id,

        "risk_level":
            risk_level,

        "score":
            score,

        "reasons":
            reasons,

        "recommendation":
            recommendation,

        "timestamp":
            datetime.utcnow()

    }


    save_risk_result(risk_result)


    # ---------------------------------------------
    # Save chat
    # ---------------------------------------------

    save_chat_message({

        "patient_id":
            request.patient_id,

        "message":
            request.message,

        "timestamp":
            datetime.utcnow()

    })


    # ---------------------------------------------
    # Chatbot context
    # ---------------------------------------------

    context = {

        "patient_profile":
            patient_profile,

        "vitals":
            vitals,

        "symptoms":
            symptoms,

        "risk_result":
            risk_result

    }


    try:

        bot_response = (
            chatbot_engine.get_response(
                request.patient_id,
                request.message,
                context
            )
        )

    except Exception as error:

        bot_response = (
            "MATERNAL_ASTRA could not reach "
            "the external AI service. Your safety "
            "assessment has still been completed "
            "using the local risk rules. Please "
            "review the risk level and recommended "
            "next step."
        )

        print(
            f"Chatbot provider error: {error}"
        )


    # ---------------------------------------------
    # Emergency alert
    # ---------------------------------------------

    if is_emergency:

        alert = {

            "patient_id":
                request.patient_id,

            "severity":
                severity,

            "reason":
                emergency_reason,

            "timestamp":
                datetime.utcnow(),

            "status":
                "NEW"

        }


        save_alert(alert)


        if request.patient_id in active_connections:

            await active_connections[
                request.patient_id
            ].send_json({

                "type":
                    "EMERGENCY_ALERT",

                "severity":
                    severity,

                "reason":
                    emergency_reason

            })


    return ChatResponse(

        response=bot_response,

        risk_level=risk_level,

        recommendation=recommendation

    )


# =====================================================
# GET PATIENT
# =====================================================

@app.get("/api/patient/{patient_id}")
async def get_patient(patient_id: str):

    profile = get_patient_profile(
        patient_id
    )


    if not profile:

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )


    return profile


# =====================================================
# GET LATEST VITALS
# =====================================================

@app.get("/api/vitals/{patient_id}")
async def get_patient_vitals(
    patient_id: str
):

    vitals = get_latest_vitals(
        patient_id
    )

    return vitals or {}


# =====================================================
# GET RISK
# =====================================================

@app.get("/api/risk/{patient_id}")
async def get_risk(patient_id: str):

    patient_risks = [

        result

        for result in risk_results

        if result.get("patient_id")
        == patient_id

    ]


    if patient_risks:

        return patient_risks[-1]


    return {

        "message":
            "No risk assessment has been generated yet"

    }


# =====================================================
# RUN SERVER
# =====================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )
