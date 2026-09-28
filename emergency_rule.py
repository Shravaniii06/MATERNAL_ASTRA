def check_emergency(reading_data, symptoms=None):

    symptoms = symptoms or []

    # -----------------------------------------
    # BP CHECK REMOVED
    # No BP sensor is being used.
    # -----------------------------------------

    # Heart rate
    heart_rate = reading_data.get("heart_rate")

    if heart_rate is not None:
        if heart_rate < 40 or heart_rate > 180:
            return (
                True,
                "EMERGENCY",
                "Abnormal heart rate detected."
            )

    # SpO2
    spo2 = reading_data.get("spo2")

    if spo2 is not None:
        if spo2 < 90:
            return (
                True,
                "EMERGENCY",
                "Very low oxygen saturation detected."
            )

    # Temperature
    temperature = reading_data.get("temperature")

    if temperature is not None:
        if temperature >= 39.0:
            return (
                True,
                "HIGH",
                "High body temperature detected."
            )

    # Symptoms
    emergency_symptoms = [
        "severe bleeding",
        "heavy bleeding",
        "chest pain",
        "fainting",
        "loss of consciousness"
    ]

    for symptom in symptoms:

        if str(symptom).lower() in emergency_symptoms:

            return (
                True,
                "EMERGENCY",
                f"Emergency symptom detected: {symptom}"
            )

    return (
        False,
        "LOW",
        "No immediate emergency indicators detected."
    )