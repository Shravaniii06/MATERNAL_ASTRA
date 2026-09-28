from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are MATERNAL_ASTRA, an AI maternal health triage assistant for clinics worldwide.

Your identity:
- Name: MATERNAL_ASTRA
- Role: Maternal health risk assessment and triage support
- You are empathetic, clear, and safety-focused
- Never diagnose or prescribe - always refer to healthcare providers

Your role:
- Collect pregnancy information through empathetic questions
- Explain risk levels clearly (Low, Medium, High, Emergency)
- Provide actionable guidance based on verified medical data
- Never diagnose or prescribe - always refer to healthcare providers
- Use simple language (Hindi or English based on user)
- Be calm, supportive, and clear

Safety rules:
- If emergency is detected, state clearly: "This may be an emergency. Please seek urgent medical care now."
- Never downplay emergency alerts
- Always encourage consulting qualified healthcare providers

Response format:
1. Acknowledge the concern
2. State risk level (if applicable)
3. Give 1-2 simple reasons
4. Provide clear next step
5. Ask one follow-up question if needed
"""

class ChatbotEngine:
    def __init__(self):
        self.conversation_history = {}
    
    def get_response(self, patient_id: str, user_message: str, context: dict) -> str:
        """
        context includes: patient_profile, vitals, symptoms, risk_result
        """
        # Initialize conversation history
        if patient_id not in self.conversation_history:
            self.conversation_history[patient_id] = []
        
        # Add context to system prompt
        context_info = self._format_context(context)
        full_system_prompt = f"{SYSTEM_PROMPT}\n\nPatient Context:\n{context_info}"
        
        # Build messages
        messages = [
            {"role": "system", "content": full_system_prompt},
            *self.conversation_history[patient_id],
            {"role": "user", "content": user_message}
        ]
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        bot_response = response.choices[0].message.content
        
        # Save to history
        self.conversation_history[patient_id].append({"role": "user", "content": user_message})
        self.conversation_history[patient_id].append({"role": "assistant", "content": bot_response})
        
        # Keep only last 10 messages
        if len(self.conversation_history[patient_id]) > 10:
            self.conversation_history[patient_id] = self.conversation_history[patient_id][-10:]
        
        return bot_response
    
    def _format_context(self, context: dict) -> str:
        lines = []
        
        if "patient_profile" in context:
            p = context["patient_profile"]
            lines.append(f"- Patient: {p.get('name', 'Unknown')}, Age: {p.get('age', 'N/A')}")
            lines.append(f"- Pregnancy: {p.get('gestational_week', 'N/A')} weeks ({p.get('trimester', 'N/A')} trimester)")
        
        if "vitals" in context:
            v = context["vitals"]
            if v.get("bp_systolic"):
                lines.append(f"- Blood Pressure: {v['bp_systolic']}/{v.get('bp_diastolic', 'N/A')}")
            if v.get("heart_rate"):
                lines.append(f"- Heart Rate: {v['heart_rate']} bpm")
            if v.get("temperature"):
                lines.append(f"- Temperature: {v['temperature']}°C")
        
        if "symptoms" in context:
            s = context["symptoms"]
            active_symptoms = [k for k, v in s.items() if v and k != "patient_id"]
            if active_symptoms:
                lines.append(f"- Symptoms: {', '.join(active_symptoms)}")
        
        if "risk_result" in context:
            r = context["risk_result"]
            lines.append(f"- Risk Level: {r.get('risk_level', 'N/A')}")
            if r.get("reasons"):
                lines.append(f"- Reasons: {', '.join(r['reasons'])}")
        
        return "\n".join(lines) if lines else "No additional context available"