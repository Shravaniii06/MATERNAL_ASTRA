from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PatientProfile(BaseModel):

    patient_id: str
    name: str
    age: int
    gestational_week: int
    trimester: str
    medical_history: Optional[str] = None
    language: str = "en"


class VitalReading(BaseModel):

    patient_id: str
    timestamp: datetime

    heart_rate: Optional[int] = None
    spo2: Optional[int] = None

    temperature: Optional[float] = None
    humidity: Optional[float] = None

    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None

    glucose: Optional[float] = None
    weight: Optional[float] = None

    movement_score: Optional[int] = None


class Symptoms(BaseModel):

    patient_id: str

    headache: bool = False
    swelling: bool = False
    bleeding: bool = False
    abdominal_pain: bool = False
    fever: bool = False
    reduced_fetal_movement: bool = False
    vision_changes: bool = False
    chest_pain: bool = False
    fainting: bool = False
    vomiting: bool = False


class ChatMessage(BaseModel):

    patient_id: str
    message: str
    timestamp: datetime


class RiskResult(BaseModel):

    patient_id: str
    risk_level: str

    score: int
    reasons: List[str]
    recommendation: str

    timestamp: datetime