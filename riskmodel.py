from sklearn.ensemble import RandomForestClassifier
import numpy as np

class RiskClassifier:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=10, random_state=42)
        # For hackathon, using simple weighted scoring
        self.feature_names = [
            "age", "gestational_week", "systolic_bp", "diastolic_bp",
            "glucose", "temperature", "heart_rate", "spo2", "bmi",
            "headache", "swelling", "bleeding", "fetal_movement_score"
        ]
    
    def calculate_risk_score(self, patient_data: dict) -> tuple:
        """
        Returns: (risk_level: str, score: int, reasons: list)
        """
        score = 0
        reasons = []
        
        # Blood pressure scoring
        systolic = patient_data.get("systolic_bp", 0)
        diastolic = patient_data.get("diastolic_bp", 0)
        
        if systolic >= 160 or diastolic >= 110:
            score += 5
            reasons.append(f"Very high BP: {systolic}/{diastolic}")
        elif systolic >= 140 or diastolic >= 90:
            score += 3
            reasons.append(f"Elevated BP: {systolic}/{diastolic}")
        
        # Symptoms scoring
        if patient_data.get("headache", False):
            score += 2
            reasons.append("Headache present")
        
        if patient_data.get("swelling", False):
            score += 2
            reasons.append("Swelling present")
        
        if patient_data.get("bleeding", False):
            score += 4
            reasons.append("Bleeding reported")
        
        if patient_data.get("fever", False):
            score += 2
            reasons.append("Fever present")
        
        if patient_data.get("reduced_fetal_movement", False):
            score += 3
            reasons.append("Reduced fetal movement")
        
        # Temperature scoring
        temp = patient_data.get("temperature", 0)
        if temp and temp >= 38.0:
            score += 2
            reasons.append(f"High temperature: {temp}°C")
        
        # Determine risk level
        if score >= 6:
            risk_level = "HIGH"
        elif score >= 3:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return risk_level, score, reasons
    
    def get_recommendation(self, risk_level: str) -> str:
        recommendations = {
            "LOW": "Continue routine antenatal care. Maintain healthy diet and rest.",
            "MEDIUM": "Schedule clinic visit within 24-72 hours for further evaluation.",
            "HIGH": "Seek same-day medical review. Monitor symptoms closely.",
            "EMERGENCY": "Seek immediate emergency medical care."
        }
        return recommendations.get(risk_level, "Consult your healthcare provider.")