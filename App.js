import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://10.255.205.63:8000/api";

const ORIGINAL_UI = `<header class="header">
<div class="brand">
<div class="logo">♡</div>
<div>
<div class="brand-name">Astra<span>Maternal</span></div>
<div class="brand-subtitle">CARE INTELLIGENCE</div>
</div>
</div>

<div class="header-actions">
<div class="status">
<span class="status-dot"></span>
Belt connected
</div>

<button class="icon-button">
文&nbsp; हिन्दी
</button>

<button class="icon-button">
☾
</button>
</div>
</header>

<main class="page">
<div class="layout">

<div class="left">

<section class="card">
<div class="top-stage">
<div>
<div class="section-label">01 · ABOUT YOU</div>
<h2 class="section-title">Pregnancy stage</h2>
</div>

<div class="stage-badge" id="stageBadge">
3rd trimester · 28–40+ weeks
</div>
</div>

<div class="stage-grid">

<div class="stage" data-stage="first" data-weeks="12">
<div class="stage-number">01</div>
First
</div>

<div class="stage" data-stage="second" data-weeks="20">
<div class="stage-number">02</div>
Second
</div>

<div class="stage active" data-stage="third" data-weeks="30">
<div class="stage-number">03</div>
Third
</div>

</div>

<div class="form-grid">

<div class="field">
<label>Patient ID</label>
<input class="input" id="patientId" value="P001"/>
</div>

<div class="field">
<label>Age</label>
<input class="input" id="ageInput" type="number" value="29"/>
</div>

<div class="field">
<label>Weeks pregnant</label>
<input class="input" id="weeksInput" type="number" value="30"/>
</div>

</div>

<div class="field weight">
<label>Weight trend</label>

<select class="select" id="weightTrend">
<option>Stable / स्थिर</option>
<option>Increasing / बढ़ रहा है</option>
<option>Decreasing / कम हो रहा है</option>
</select>

</div>
</section>


<section class="card">

<div class="top-stage">

<div>
<div class="section-label">02 · LATEST VITALS</div>
<h2 class="section-title">
What your body is telling us
</h2>
</div>

<div style="color:#537a6d;font-size:11px;">
◉ &nbsp;Belt telemetry
</div>

</div>

<div class="telemetry">

<div class="telemetry-left">

<div class="telemetry-icon">
〽
</div>

<div>

<div class="telemetry-title">
Belt is streaming live
</div>

<div class="telemetry-info" id="beltInfo">
Connecting to belt…
</div>

</div>

</div>

<button class="manual">
Toggle belt
</button>

</div>


<div class="belt-metric-grid">

<div>
<div class="metric-label">
♡ Heart rate <small>bpm</small>
</div>

<input
class="input"
id="heartRate"
readonly=""
value="Measuring..."
/>
</div>


<div>
<div class="metric-label">
◉ SpO₂ <small>% · TEST</small>
</div>

<input
class="input"
id="spo2"
readonly=""
value="—"
/>
</div>


<div>
<div class="metric-label">
♧ Temperature <small>°C</small>
</div>

<input
class="input"
id="temperature"
readonly=""
value="—"
/>
</div>


<div>
<div class="metric-label">
Humidity <small>%</small>
</div>

<input
class="input"
id="humidity"
readonly=""
value="—"
/>
</div>


<div>
<div class="metric-label">
Movement <small>/100</small>
</div>

<input
class="input"
id="movement"
readonly=""
value="—"
/>
</div>

</div>
</section>


<section class="card symptom-card">

<div class="section-label">
03 · HOW ARE YOU FEELING?
</div>

<h2 class="section-title">
How are you feeling?
</h2>

<div class="symptoms-intro">
Select anything that applies. If you feel unsafe, seek urgent help now.
</div>


<div class="symptoms">

<label class="symptom">
<input class="checkbox" type="checkbox" value="Severe headache"/>
<div>
<div class="symptom-name">Severe headache</div>
<div class="symptom-hi">तेज़ सिरदर्द</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Vision changes"/>
<div>
<div class="symptom-name">Vision changes</div>
<div class="symptom-hi">दृष्टि में बदलाव</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Swelling"/>
<div>
<div class="symptom-name">Swelling</div>
<div class="symptom-hi">सूजन</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Heavy bleeding"/>
<div>
<div class="symptom-name">Heavy bleeding</div>
<div class="symptom-hi">बहुत अधिक रक्तस्राव</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Abdominal pain"/>
<div>
<div class="symptom-name">Abdominal pain</div>
<div class="symptom-hi">पेट में दर्द</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Severe abdominal pain"/>
<div>
<div class="symptom-name">Severe abdominal pain</div>
<div class="symptom-hi">तेज़ पेट दर्द</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Reduced fetal movement"/>
<div>
<div class="symptom-name">Reduced fetal movement</div>
<div class="symptom-hi">बच्चे की हलचल कम</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Fever with chills"/>
<div>
<div class="symptom-name">Fever with chills</div>
<div class="symptom-hi">ठंड के साथ बुखार</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Persistent vomiting"/>
<div>
<div class="symptom-name">Persistent vomiting</div>
<div class="symptom-hi">लगातार उल्टी</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Fainting"/>
<div>
<div class="symptom-name">Fainting</div>
<div class="symptom-hi">बेहोशी</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Seizure"/>
<div>
<div class="symptom-name">Seizure</div>
<div class="symptom-hi">दौरा</div>
</div>
</label>


<label class="symptom">
<input class="checkbox" type="checkbox" value="Chest pain"/>
<div>
<div class="symptom-name">Chest pain</div>
<div class="symptom-hi">सीने में दर्द</div>
</div>
</label>


<label class="symptom">
<input
class="checkbox"
type="checkbox"
value="Severe shortness of breath"
/>

<div>
<div class="symptom-name">
Severe shortness of breath
</div>

<div class="symptom-hi">
सांस लेने में बहुत तकलीफ़
</div>

</div>
</label>

</div>
</section>


<section class="card ask-card">

<div class="ask-header">

<div class="ask-icon">
♡
</div>

<div>

<div class="ask-label">
04 · ASK ASTRA
</div>

<div class="ask-title">
Anything else on your mind?
</div>

</div>
</div>


<div class="chat-input-wrap">

<input
class="chat-input"
id="chatInput"
placeholder="For example: I have felt more tired today..."
/>

<button class="mic">
♩
</button>

</div>

<div class="voice-note">
♩ Voice input simulated · responses stay short and simple
</div>

<div class="chat-result" id="chatResult"></div>

</section>


<div class="check-row">

<label class="offline">

<input id="offline" type="checkbox"/>

<div>

<div class="offline-title">
Simulate offline mode
</div>

<div class="offline-text">
Basic safety rules still run. This check will queue to sync later.
</div>

</div>

</label>


<button class="check-button">
Check my risk&nbsp;&nbsp; →
</button>

</div>


<footer class="footer">

<div>
© AstraMaternal demo workspace
</div>

<div>
🛡 Privacy-first · no diagnosis · no prescriptions
</div>

</footer>

</div>


<div class="right">

<section class="card result-card">

<div class="result-icon">
♡
</div>

<div class="result-heading">
YOUR RESULT WILL APPEAR HERE
</div>

<div class="result-title" id="resultTitle">
Start with how you feel today.
</div>

<div class="result-description" id="resultDescription">
We use your stage, vitals, and symptoms to explain a safe
next step. This is support, not a diagnosis.
</div>

<div class="steps" id="stepsBox">

<div class="step">
<div class="step-number">1</div>
Share your details
</div>

<div class="step">
<div class="step-number">2</div>
Check your risk
</div>

<div class="step">
<div class="step-number">3</div>
Know what to do next
</div>

</div>

</section>


<section class="card reminder-card">

<div class="reminder-header">

<div class="reminder-icon">
♧
</div>

<div>

<div class="reminder-title">
Stay on top of care
</div>

<div class="reminder-sub">
Small reminders can make prenatal care easier.
</div>

</div>
</div>


<div class="reminder-fields">

<input
class="reminder-input"
id="reminderName"
placeholder="Reminder name (e.g., Check BP)"
/>

<select class="reminder-input" id="reminderType">

<option value="BP check">
BP check
</option>

<option value="Medicine">
Medicine / supplement
</option>

<option value="Doctor appointment">
Doctor appointment
</option>

<option value="Glucose check">
Glucose check
</option>

<option value="Hydration">
Hydration
</option>

</select>


<input
class="reminder-input"
id="reminderDateTime"
type="datetime-local"
/>

<button class="add-reminder">
+ Add reminder
</button>

</div>


<div
id="reminderStatus"
style={{
  marginTop: "8px",
  color: "#5f7970",
  fontSize: "10px"
}}
>
Your reminders are saved privately on this device.
</div>

<div
class="reminder-list"
id="reminderList"
>
</div>

</section>

</div>

</div>
</main>


<div class="preview-bar">

<div class="preview-text">
Frontend Preview Only. Please wake servers to enable backend functionality.
</div>

<button class="wake">
Wake up servers
</button>

</div>`;


export default function App() {

  const [loggedIn, setLoggedIn] = useState(false);

  const [loginPatientId, setLoginPatientId] = useState("");

  const [loginError, setLoginError] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);


  async function handleLogin(e) {

    e.preventDefault();

    const id = loginPatientId.trim();

    if (!id) {
      setLoginError("Please enter Patient ID");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {

      const r = await fetch(
        `${API_URL}/vitals/${encodeURIComponent(id)}`
      );

      if (!r.ok) {
        throw new Error("Patient not found");
      }

      const data = await r.json();

      if (!data || Object.keys(data).length === 0) {
        throw new Error("No patient data");
      }

      setLoggedIn(true);

    } catch (e) {

      setLoginError(
        "Patient ID not found. Please enter a valid Patient ID."
      );

    } finally {

      setLoginLoading(false);

    }
  }


  useEffect(() => {

    if (!loggedIn) return;

    let currentStage = "third";


    const $ = (id) =>
      document.getElementById(id);


    function setValue(id, value, suffix = "") {

      const el = $(id);

      if (!el) return;

      el.value =
        value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : String(value) + suffix;
    }


    async function loadVitals() {

      try {

        const id =
          (($("patientId")?.value || "P001").trim());


        const r = await fetch(
          `${API_URL}/vitals/${encodeURIComponent(id)}`
        );


        if (!r.ok) {
          throw new Error("vitals unavailable");
        }


        const v = await r.json();


        if (!v || Object.keys(v).length === 0) {
          return;
        }


        setValue(
          "heartRate",
          v.heart_rate == null
            ? "Measuring..."
            : v.heart_rate,
          v.heart_rate == null
            ? ""
            : " bpm"
        );


        setValue(
          "spo2",
          v.spo2,
          " %"
        );


        setValue(
          "temperature",
          v.temperature,
          " °C"
        );


        setValue(
          "humidity",
          v.humidity,
          " %"
        );


        setValue(
          "movement",
          v.movement_score,
          " /100"
        );


        const beltInfo =
          $("beltInfo");


        if (beltInfo) {

          beltInfo.innerText =
            `HR ${
              v.heart_rate == null
                ? "Measuring..."
                : v.heart_rate + " bpm"
            } · Temp ${
              v.temperature ?? "—"
            }°C · Movement ${
              v.movement_score ?? "—"
            }/100`;

        }


        const status =
          document.querySelector(".status");


        if (status) {

          status.innerHTML =
            '<span class="status-dot"></span> Belt connected';

        }

      } catch (e) {

        console.error(
          "LIVE VITALS ERROR:",
          e
        );

        const info =
          $("beltInfo");

        if (info) {

          info.innerText =
            "Waiting for belt telemetry…";

        }

      }
    }


    function symptomPayload() {

      const selected =
        [
          ...document.querySelectorAll(
            ".symptom .checkbox:checked"
          )
        ].map(
          x => x.value
        );


      const has =
        n => selected.includes(n);


      return {

        patient_id:
          (($("patientId")?.value || "P001").trim()),

        pregnancy_stage:
          currentStage,

        severe_headache:
          has("Severe headache"),

        heavy_bleeding:
          has("Heavy bleeding"),

        abdominal_pain:
          has("Abdominal pain") ||
          has("Severe abdominal pain"),

        chest_pain:
          has("Chest pain"),

        fainting:
          has("Fainting"),

        vision_changes:
          has("Vision changes"),

        persistent_vomiting:
          has("Persistent vomiting"),

        swelling:
          has("Swelling"),

        fever:
          has("Fever with chills"),

        seizure:
          has("Seizure"),

        reduced_fetal_movement:
          has("Reduced fetal movement"),

        severe_shortness_of_breath:
          has("Severe shortness of breath")

      };
    }


    async function saveSymptoms() {

      try {

        await fetch(
          `${API_URL}/symptoms`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                symptomPayload()
              )
          }
        );

      } catch (e) {}

    }


    async function ensurePatient() {

      const id =
        (($("patientId")?.value || "P001").trim());

      const age =
        parseInt(
          $("ageInput")?.value
        ) || 29;

      const weeks =
        parseInt(
          $("weeksInput")?.value
        ) || 30;


      try {

        let r =
          await fetch(
            `${API_URL}/patient/${encodeURIComponent(id)}`
          );


        if (r.ok) {
          return true;
        }


        r =
          await fetch(
            `${API_URL}/patient`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  patient_id: id,
                  age,
                  gestational_week: weeks
                })
            }
          );


        return r.ok;

      } catch (e) {

        return false;

      }
    }


    async function checkRisk() {

      const title =
        $("resultTitle");

      const desc =
        $("resultDescription");

      const steps =
        $("stepsBox");


      await saveSymptoms();


      try {

        const ok =
          await ensurePatient();


        if (ok) {

          const id =
            (($("patientId")?.value || "P001").trim());


          const selected =
            [
              ...document.querySelectorAll(
                ".symptom .checkbox:checked"
              )
            ].map(
              x => x.value
            );


          const message =
            selected.length
              ? `Please assess my selected symptoms: ${selected.join(", ")}`
              : "Please assess my current maternal health status using my symptoms and latest belt vitals.";


          const r =
            await fetch(
              `${API_URL}/chat`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify({
                    patient_id: id,
                    message
                  })
              }
            );


          if (r.ok) {

            const d =
              await r.json();


            if (title) {

              title.innerText =
                d.risk_level
                  ? `Risk Level: ${d.risk_level}`
                  : "Risk assessed";

            }


            if (desc) {

              desc.innerText =
                (
                  d.response ||
                  d.recommendation ||
                  "Risk assessment completed."
                ) +
                "\n\nLive belt values are shown on the left.";

            }


            if (steps) {
              steps.classList.add("hidden");
            }


            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });


            return;
          }
        }

      } catch (e) {}


      if (title) {
        title.innerText =
          "Risk assessment unavailable";
      }


      if (desc) {

        desc.innerText =
          "Please make sure the MATERNAL_ASTRA backend is running and try again.";

      }

    }


    async function askAstra() {

      const input =
        $("chatInput");

      const result =
        $("chatResult");


      const message =
        input?.value.trim();


      if (!message) {
        return;
      }


      result.classList.add("show");

      result.innerHTML =
        "Astra is thinking…";


      await saveSymptoms();


      try {

        const ok =
          await ensurePatient();


        if (!ok) {
          throw new Error("patient");
        }


        const id =
          (($("patientId")?.value || "P001").trim());


        const r =
          await fetch(
            `${API_URL}/chat`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  patient_id: id,
                  message
                })
            }
          );


        const d =
          await r.json();


        result.innerHTML =
          `<strong>Astra:</strong><br>${
            d.response ||
            d.recommendation ||
            "Please continue monitoring your symptoms and seek medical care if you feel unsafe."
          }`;


      } catch (e) {

        result.innerHTML =
          "<strong>Astra:</strong><br>Backend is not available right now. Please start the backend and try again.";

      }

    }


    function toggleDark() {

      document.body.classList.toggle(
        "dark"
      );

    }


    function toggleLanguage() {

      alert(
        "हिंदी मोड सक्रिय है।\n\nयह demo interface bilingual है."
      );

    }


    function toggleBeltSimulation() {

      const info =
        $("beltInfo");

      if (info) {

        info.innerText =
          "Live belt telemetry is being read from ESP32.";

      }

    }


    function voiceDemo() {

      const input =
        $("chatInput");

      if (input) {

        input.placeholder =
          "Voice input simulated — type your message here...";

        input.focus();

      }

    }


    const REMINDER_STORAGE_KEY =
      "astra_maternal_reminders";


    function getReminders() {

      const s =
        localStorage.getItem(
          REMINDER_STORAGE_KEY
        );

      return s
        ? JSON.parse(s)
        : [];

    }


    function saveReminders(items) {

      localStorage.setItem(
        REMINDER_STORAGE_KEY,
        JSON.stringify(items)
      );

    }


    function formatReminderDate(v) {

      if (!v) {
        return "Time not selected";
      }


      return new Date(v).toLocaleString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit"
        }
      );

    }


    function renderReminders() {

      const list =
        $("reminderList");

      const status =
        $("reminderStatus");


      if (!list || !status) {
        return;
      }


      const items =
        getReminders();


      list.innerHTML = "";


      if (!items.length) {

        status.innerText =
          "No reminders yet. Add one to stay on top of your care.";

        return;
      }


      status.innerText =
        `${items.length} reminder(s) saved privately on this device.`;


      items
        .sort(
          (a, b) =>
            new Date(a.dateTime) -
            new Date(b.dateTime)
        )
        .forEach(x => {

          const d =
            document.createElement(
              "div"
            );


          d.className =
            "reminder-item";


          d.innerHTML =
            `<div class="reminder-item-left">
              <div class="reminder-item-title">
                ${x.name}
              </div>
              <div class="reminder-item-time">
                ${x.type} · ${formatReminderDate(x.dateTime)}
              </div>
            </div>
            <button class="delete-reminder">
              ×
            </button>`;


          d.querySelector(
            ".delete-reminder"
          ).addEventListener(
            "click",
            () => {

              saveReminders(
                getReminders().filter(
                  r => r.id !== x.id
                )
              );

              renderReminders();

            }
          );


          list.appendChild(d);

        });

    }


    function addReminder() {

      const n =
        $("reminderName");

      const t =
        $("reminderType");

      const dt =
        $("reminderDateTime");


      if (
        !n?.value.trim() ||
        !dt?.value
      ) {

        alert(
          "Please enter a reminder name and date/time."
        );

        return;
      }


      const items =
        getReminders();


      items.push({
        id: Date.now().toString(),
        name: n.value.trim(),
        type: t.value,
        dateTime: dt.value
      });


      saveReminders(items);


      n.value = "";

      dt.value = "";


      renderReminders();

    }


    async function wakeServers() {

      try {

        const r =
          await fetch(
            `${API_URL}/health`
          );


        if (!r.ok) {
          throw new Error("offline");
        }


        const preview =
          document.querySelector(
            ".preview-text"
          );


        const wake =
          document.querySelector(
            ".wake"
          );


        if (preview) {

          preview.innerText =
            "Backend connected · Live belt telemetry enabled";

        }


        if (wake) {

          wake.innerText =
            "Backend connected ✓";

        }


      } catch (e) {

        const preview =
          document.querySelector(
            ".preview-text"
          );


        if (preview) {

          preview.innerText =
            "Backend offline · start FastAPI to enable live data";

        }

      }

    }


    // Stage buttons
    document
      .querySelectorAll(".stage")
      .forEach(stage => {

        stage.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(".stage")
              .forEach(x =>
                x.classList.remove(
                  "active"
                )
              );


            stage.classList.add(
              "active"
            );


            currentStage =
              stage.dataset.stage;


            if ($("weeksInput")) {

              $("weeksInput").value =
                stage.dataset.weeks;

            }


            const badge =
              $("stageBadge");


            if (badge) {

              badge.innerText =
                currentStage === "first"
                  ? "1st trimester · 1–12 weeks"
                  : currentStage === "second"
                    ? "2nd trimester · 13–27 weeks"
                    : "3rd trimester · 28–40+ weeks";

            }

          }
        );

      });


    document
      .querySelectorAll(".symptom")
      .forEach(item => {

        const cb =
          item.querySelector(
            ".checkbox"
          );


        if (cb) {

          cb.addEventListener(
            "change",
            () =>
              item.classList.toggle(
                "selected",
                cb.checked
              )
          );

        }

      });


    $("chatInput")?.addEventListener(
      "keydown",
      e => {

        if (e.key === "Enter") {
          askAstra();
        }

      }
    );


    document
      .querySelector(".check-button")
      ?.addEventListener(
        "click",
        checkRisk
      );


    document
      .querySelector(".mic")
      ?.addEventListener(
        "click",
        voiceDemo
      );


    document
      .querySelector(".manual")
      ?.addEventListener(
        "click",
        toggleBeltSimulation
      );


    document
      .querySelector(".wake")
      ?.addEventListener(
        "click",
        wakeServers
      );


    const iconButtons =
      document.querySelectorAll(
        ".icon-button"
      );


    if (iconButtons[0]) {
      iconButtons[0].addEventListener(
        "click",
        toggleLanguage
      );
    }


    if (iconButtons[1]) {
      iconButtons[1].addEventListener(
        "click",
        toggleDark
      );
    }


    document
      .querySelector(".add-reminder")
      ?.addEventListener(
        "click",
        addReminder
      );


    const patientField =
      $("patientId");


    if (
      patientField &&
      loginPatientId
    ) {

      patientField.value =
        loginPatientId;

    }


    renderReminders();

    wakeServers();

    loadVitals();


    // LIVE UPDATE EVERY 1 SECOND
    const timer =
      setInterval(
        loadVitals,
        1000
      );


    const tomorrow =
      new Date();


    tomorrow.setDate(
      tomorrow.getDate() + 1
    );


    tomorrow.setHours(
      8,
      0,
      0,
      0
    );


    const reminderInput =
      $("reminderDateTime");


    if (
      reminderInput &&
      !reminderInput.value
    ) {

      reminderInput.value =
        new Date(
          tomorrow.getTime() -
          tomorrow.getTimezoneOffset() *
            60000
        )
          .toISOString()
          .slice(0, 16);

    }


    return () =>
      clearInterval(timer);


  }, [
    loggedIn,
    loginPatientId
  ]);


  if (!loggedIn) {

    return (

      <div className="login-page">

        <div className="login-card">

          <div className="login-logo">
            ♡
          </div>


          <h1>
            Astra<span>Maternal</span>
          </h1>


          <p className="login-subtitle">
            CARE INTELLIGENCE
          </p>


          <div className="login-divider"></div>


          <h2>
            Welcome back
          </h2>


          <p className="login-text">
            Enter your Patient ID to access
            your maternal health dashboard.
          </p>


          <form onSubmit={handleLogin}>

            <label>
              Patient ID
            </label>


            <input
              type="text"
              placeholder="Enter Patient ID"
              value={loginPatientId}
              onChange={
                e =>
                  setLoginPatientId(
                    e.target.value
                  )
              }
              autoComplete="off"
            />


            {loginError && (

              <div className="login-error">
                {loginError}
              </div>

            )}


            <button
              type="submit"
              className="login-button"
              disabled={loginLoading}
            >

              {
                loginLoading
                  ? "Checking..."
                  : "Login →"
              }

            </button>

          </form>


          <div className="login-footer">
            🔒 Your health information stays private
          </div>

        </div>

      </div>

    );

  }


  return (

    <div className="app">

      <div className="logged-patient-bar">

        <span>
          Logged in as{" "}
          <strong>
            {loginPatientId}
          </strong>
        </span>


        <button
          onClick={() => {

            setLoggedIn(false);

            setLoginPatientId("");

          }}
        >
          Logout
        </button>

      </div>


      <div
        dangerouslySetInnerHTML={{
          __html: ORIGINAL_UI
        }}
      />

    </div>

  );

}