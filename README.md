# MATERNAL ASTRA 🌸
### AI-Powered Maternal Health Monitoring & Risk Assessment System

MATERNAL ASTRA is an intelligent maternal health monitoring and decision-support system designed to help monitor pregnancy-related health parameters using real-time sensor data, automated risk assessment, and an AI-powered conversational assistant.

The system combines **IoT-based physiological monitoring, a local risk assessment engine, FastAPI backend, React frontend, and OpenAI GPT-4o-mini** to provide an integrated maternal health monitoring experience.

---

## 🚨 Problem Statement

Pregnant women may experience sudden changes in physiological parameters or symptoms that require timely attention. Conventional monitoring often depends on periodic clinical visits, making continuous monitoring difficult.

MATERNAL ASTRA aims to provide:

- Real-time monitoring of selected maternal health parameters
- Early identification of potentially concerning conditions
- Automated risk-level assessment
- Conversational guidance through an AI assistant
- A centralized interface for patient information and monitoring

> **Note:** MATERNAL ASTRA is a prototype decision-support system and does not replace professional medical diagnosis or treatment.

---

# 💡 Proposed Solution

MATERNAL ASTRA integrates wearable/IoT sensors with a web-based healthcare interface.

The ESP32 collects sensor readings and sends them to the FastAPI backend through Wi-Fi. The backend stores the latest readings, evaluates predefined emergency conditions, calculates the patient's risk level, and provides relevant information to the AI chatbot.

The React frontend displays the patient's profile, symptoms, risk assessment, and live sensor values.

---

# 🏗️ System Architecture

```text
                 ┌─────────────────────┐
                 │   Maternal Patient  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   IoT Sensor Layer  │
                 │                     │
                 │ • DHT11             │
                 │ • HW-827 Pulse      │
                 │ • MPU6050            │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │        ESP32        │
                 │ Data Acquisition &  │
                 │ Wi-Fi Communication │
                 └──────────┬──────────┘
                            │ HTTP/JSON
                            ▼
                 ┌─────────────────────┐
                 │      FastAPI        │
                 │      Backend        │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
      ┌────────────┐ ┌─────────────┐ ┌──────────────┐
      │ Emergency  │ │ Risk         │ │ Chatbot      │
      │ Rule Engine│ │ Assessment   │ │ Engine       │
      └────────────┘ └─────────────┘ └──────┬───────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │ OpenAI API  │
                                      │ GPT-4o-mini │
                                      └──────┬──────┘
                                             │
                                             ▼
                                  ┌────────────────────┐
                                  │ React Web Interface│
                                  │                    │
                                  │ • Live Vitals      │
                                  │ • Risk Assessment  │
                                  │ • Astra Chatbot    │
                                  │ • Symptoms         │
                                  └────────────────────┘
