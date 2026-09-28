# Simple in-memory database for MATERNAL_ASTRA
# No Firebase needed!

patients = {}
vitals_data = {}
symptoms_data = {}
risk_results = []
alerts = []
chat_history = []


# =====================================================
# PATIENT
# =====================================================

def save_patient_profile(profile: dict):
    patient_id = profile.get("patient_id")

    patients[patient_id] = profile

    print(">>> PATIENT SAVED:")
    print(profile)


def get_patient_profile(patient_id: str):
    return patients.get(patient_id)


# =====================================================
# VITALS
# =====================================================

def save_vital_reading(reading: dict):
    patient_id = reading.get("patient_id")

    print("\n>>> SAVING VITAL READING")
    print("Patient ID:", patient_id)
    print("Reading:", reading)

    if not patient_id:
        print("!!! ERROR: patient_id missing")
        return

    # Save latest reading
    vitals_data[patient_id] = reading

    print(">>> VITALS DATABASE:")
    print(vitals_data)


def get_latest_vitals(patient_id: str):

    print("\n>>> GETTING LOCAL VITALS")
    print("Requested Patient ID:", patient_id)

    result = vitals_data.get(patient_id)

    print(">>> CURRENT VITALS DATABASE:")
    print(vitals_data)

    print(">>> RETURNING:")
    print(result)

    return result

# =====================================================
# SYMPTOMS
# =====================================================

def save_symptoms(symptoms: dict):
    patient_id = symptoms.get("patient_id")

    symptoms_data[patient_id] = symptoms

    print(">>> SYMPTOMS SAVED:")
    print(symptoms)


def get_latest_symptoms(patient_id: str):
    return symptoms_data.get(patient_id)


# =====================================================
# CHAT
# =====================================================

def save_chat_message(message: dict):
    chat_history.append(message)


# =====================================================
# ALERTS
# =====================================================

def save_alert(alert: dict):
    alerts.append(alert)


def get_all_alerts():
    return alerts


# =====================================================
# RISK
# =====================================================

def save_risk_result(result: dict):
    risk_results.append(result)


# =====================================================
# PATIENT DATA
# =====================================================

def get_all_patients():
    return list(patients.values())


def get_patient_history(patient_id: str):
    return [
        msg
        for msg in chat_history
        if msg.get("patient_id") == patient_id
    ]
