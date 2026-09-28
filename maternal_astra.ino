#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <DHT.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <time.h>
#include <math.h>

// =====================================================
// WIFI SETTINGS
// =====================================================

const char* WIFI_SSID = "Airtel_ramr_3653";
const char* WIFI_PASSWORD = "air38581";

const char* SERVER_URL =
  "http://192.168.1.3:8000/api/vitals";

const char* PATIENT_ID = "P001";

// =====================================================
// SENSOR PINS
// =====================================================

#define DHT_PIN 4
#define DHT_TYPE DHT11

// HW-827 pulse sensor
#define PULSE_PIN 34

// MPU6050
#define SDA_PIN 21
#define SCL_PIN 22

// =====================================================
// SENSOR OBJECTS
// =====================================================

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_MPU6050 mpu;

// =====================================================
// HEART RATE VARIABLES
// =====================================================

int pulseValue = 0;

float pulseFiltered = 0;
float pulseBaseline = 0;

int BPM = 0;

bool beatDetected = false;

unsigned long lastPulseSample = 0;
unsigned long lastBeatTime = 0;

const unsigned long PULSE_SAMPLE_INTERVAL = 10;

// Minimum and maximum allowed BPM
const int MIN_BPM = 40;
const int MAX_BPM = 180;

// =====================================================
// SpO2
// =====================================================
// TEST VALUE ONLY.
// This is NOT a real SpO2 measurement.

int spo2Value = 97;

unsigned long lastSpO2Update = 0;

// =====================================================
// SERVER TIMER
// =====================================================

unsigned long lastServerSend = 0;

const unsigned long SERVER_INTERVAL = 2000;

// =====================================================
// WIFI
// =====================================================

void connectWiFi() {

  Serial.println();
  Serial.println("Connecting to WiFi...");

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  int attempts = 0;

  while (
    WiFi.status() != WL_CONNECTED &&
    attempts < 30
  ) {

    delay(500);

    Serial.print(".");

    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("========================================");
    Serial.println("WiFi Connected!");

    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());

    Serial.println("========================================");

  } else {

    Serial.println(
      "WiFi connection FAILED"
    );
  }
}

// =====================================================
// TIME / NTP
// =====================================================

void setupTime() {

  configTime(
    19800,
    0,
    "pool.ntp.org",
    "time.nist.gov"
  );

  Serial.println(
    "Synchronizing time..."
  );

  struct tm timeinfo;

  int attempts = 0;

  while (
    !getLocalTime(&timeinfo) &&
    attempts < 20
  ) {

    delay(500);

    Serial.print(".");

    attempts++;
  }

  Serial.println();

  if (getLocalTime(&timeinfo)) {

    Serial.println(
      "Time synchronized."
    );

  } else {

    Serial.println(
      "Time synchronization failed."
    );
  }
}

// =====================================================
// GET TIMESTAMP
// =====================================================

String getTimestamp() {

  struct tm timeinfo;

  if (!getLocalTime(&timeinfo)) {

    return "2026-01-01T00:00:00";
  }

  char buffer[30];

  strftime(
    buffer,
    sizeof(buffer),
    "%Y-%m-%dT%H:%M:%S",
    &timeinfo
  );

  return String(buffer);
}

// =====================================================
// HEART RATE PROCESSING
// =====================================================

void updateHeartRate() {

  unsigned long now = millis();

  // ---------------------------------------------------
  // CONTINUOUS SAMPLING
  // ---------------------------------------------------

  if (
    now - lastPulseSample <
    PULSE_SAMPLE_INTERVAL
  ) {

    return;
  }

  lastPulseSample = now;

  // Read HW-827
  pulseValue = analogRead(
    PULSE_PIN
  );

  // ---------------------------------------------------
  // INITIALIZE FILTER
  // ---------------------------------------------------

  if (pulseBaseline == 0) {

    pulseBaseline =
      pulseValue;

    pulseFiltered =
      pulseValue;

    return;
  }

  // ---------------------------------------------------
  // LOW PASS FILTER
  // ---------------------------------------------------

  pulseFiltered =
    (0.85f * pulseFiltered) +
    (0.15f * pulseValue);

  // ---------------------------------------------------
  // SLOW BASELINE TRACKING
  // ---------------------------------------------------

  pulseBaseline =
    (0.995f * pulseBaseline) +
    (0.005f * pulseFiltered);

  // Difference from baseline
  float signal =
    pulseFiltered -
    pulseBaseline;

  // ---------------------------------------------------
  // ADAPTIVE THRESHOLD
  // ---------------------------------------------------

  const float threshold = 20.0f;

  // ---------------------------------------------------
  // BEAT DETECTION
  // ---------------------------------------------------

  if (
    signal > threshold &&
    !beatDetected
  ) {

    beatDetected = true;

    unsigned long currentBeat =
      millis();

    // We need at least one previous beat
    if (lastBeatTime > 0) {

      unsigned long interval =
        currentBeat -
        lastBeatTime;

      // Accept 40–180 BPM
      if (
        interval >= 333 &&
        interval <= 1500
      ) {

        int newBPM =
          60000 /
          interval;

        if (
          newBPM >= MIN_BPM &&
          newBPM <= MAX_BPM
        ) {

          // Smooth the BPM
          if (BPM == 0) {

            BPM = newBPM;

          } else {

            BPM =
              (BPM * 0.7) +
              (newBPM * 0.3);
          }

          Serial.print(
            "❤️ REAL HEART RATE: "
          );

          Serial.print(BPM);

          Serial.println(
            " BPM"
          );
        }
      }
    }

    lastBeatTime =
      currentBeat;
  }

  // ---------------------------------------------------
  // WAIT FOR SIGNAL TO FALL
  // ---------------------------------------------------

  if (
    signal <
    threshold * 0.3
  ) {

    beatDetected = false;
  }

  // ---------------------------------------------------
  // REMOVE OLD VALUE
  // ---------------------------------------------------

  if (
    lastBeatTime > 0 &&
    now - lastBeatTime > 5000
  ) {

    BPM = 0;
  }
}

// =====================================================
// SEND DATA TO FASTAPI
// =====================================================

void sendDataToServer(
  float temperature,
  float humidity,
  int heartRate,
  int spo2,
  int movementScore
) {

  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      "WiFi disconnected. Reconnecting..."
    );

    connectWiFi();

    if (
      WiFi.status() != WL_CONNECTED
    ) {

      Serial.println(
        "Unable to reconnect."
      );

      return;
    }
  }

  HTTPClient http;

  http.begin(
    SERVER_URL
  );

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  String timestamp =
    getTimestamp();

  // ===================================================
  // JSON
  // ===================================================

  String json = "{";

  json +=
    "\"patient_id\":\"";

  json +=
    PATIENT_ID;

  json +=
    "\",";

  json +=
    "\"timestamp\":\"";

  json +=
    timestamp;

  json +=
    "\",";

  // ---------------------------------------------------
  // HEART RATE
  // ---------------------------------------------------

  if (
    heartRate >= MIN_BPM &&
    heartRate <= MAX_BPM
  ) {

    json +=
      "\"heart_rate\":";

    json +=
      String(heartRate);

    json += ",";

  } else {

    json +=
      "\"heart_rate\":null,";
  }

  // ---------------------------------------------------
  // SpO2
  // ---------------------------------------------------

  json +=
    "\"spo2\":";

  json +=
    String(spo2);

  json += ",";

  // ---------------------------------------------------
  // TEMPERATURE
  // ---------------------------------------------------

  if (
    !isnan(temperature)
  ) {

    json +=
      "\"temperature\":";

    json +=
      String(
        temperature,
        1
      );

    json += ",";

  } else {

    json +=
      "\"temperature\":null,";
  }

  // ---------------------------------------------------
  // HUMIDITY
  // ---------------------------------------------------

  if (
    !isnan(humidity)
  ) {

    json +=
      "\"humidity\":";

    json +=
      String(
        humidity,
        1
      );

    json += ",";

  } else {

    json +=
      "\"humidity\":null,";
  }

  // ---------------------------------------------------
  // MOVEMENT
  // ---------------------------------------------------

  json +=
    "\"movement_score\":";

  json +=
    String(
      movementScore
    );

  json += "}";

  // ===================================================
  // SERIAL
  // ===================================================

  Serial.println();
  Serial.println(
    "Sending data to server:"
  );

  Serial.println(json);

  // ===================================================
  // POST
  // ===================================================

  int httpResponseCode =
    http.POST(json);

  Serial.print(
    "HTTP Response Code: "
  );

  Serial.println(
    httpResponseCode
  );

  if (
    httpResponseCode > 0
  ) {

    String response =
      http.getString();

    Serial.println(
      "Server Response:"
    );

    Serial.println(
      response
    );

  } else {

    Serial.print(
      "HTTP Error: "
    );

    Serial.println(
      http.errorToString(
        httpResponseCode
      )
    );
  }

  http.end();
}

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(
    115200
  );

  delay(1000);

  Serial.println();

  Serial.println(
    "========================================"
  );

  Serial.println(
    "       MATERNAL ASTRA - ESP32"
  );

  Serial.println(
    "========================================"
  );

  // ===================================================
  // DHT11
  // ===================================================

  dht.begin();

  Serial.println(
    "DHT11 : INITIALIZED"
  );

  // ===================================================
  // I2C
  // ===================================================

  Wire.begin(
    SDA_PIN,
    SCL_PIN
  );

  // ===================================================
  // MPU6050
  // ===================================================

  if (
    mpu.begin(0x68)
  ) {

    Serial.println(
      "GY-521 : OK"
    );

    mpu.setAccelerometerRange(
      MPU6050_RANGE_8_G
    );

    mpu.setGyroRange(
      MPU6050_RANGE_500_DEG
    );

    mpu.setFilterBandwidth(
      MPU6050_BAND_21_HZ
    );

  } else {

    Serial.println(
      "GY-521 : NOT FOUND"
    );
  }

  // ===================================================
  // HW-827
  // ===================================================

  pinMode(
    PULSE_PIN,
    INPUT
  );

  analogReadResolution(
    12
  );

  Serial.println(
    "HW-827 : READY"
  );

  // ===================================================
  // WIFI
  // ===================================================

  connectWiFi();

  // ===================================================
  // NTP
  // ===================================================

  setupTime();

  Serial.println();

  Serial.println(
    "System Ready!"
  );

  Serial.println(
    "Place finger gently on HW-827."
  );

  Serial.println(
    "Waiting for real pulse signal..."
  );

  Serial.println(
    "----------------------------------------"
  );
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  // ===================================================
  // HEART RATE
  // IMPORTANT:
  // This runs continuously without delay.
  // ===================================================

  updateHeartRate();

  // ===================================================
  // DHT11
  // ===================================================

  float temperature =
    dht.readTemperature();

  float humidity =
    dht.readHumidity();

  // ===================================================
  // MPU6050
  // ===================================================

  sensors_event_t acceleration;
  sensors_event_t gyro;
  sensors_event_t temp;

  float ax = 0;
  float ay = 0;
  float az = 0;

  float totalAcceleration = 0;

  bool mpuOK =
    mpu.getEvent(
      &acceleration,
      &gyro,
      &temp
    );

  if (mpuOK) {

    ax =
      acceleration.acceleration.x;

    ay =
      acceleration.acceleration.y;

    az =
      acceleration.acceleration.z;

    totalAcceleration =
      sqrt(
        ax * ax +
        ay * ay +
        az * az
      );
  }

  // ===================================================
  // MOVEMENT SCORE
  // ===================================================

  int movementScore = 0;

  if (mpuOK) {

    movementScore =
      (int)(
        totalAcceleration * 5
      );

    if (
      movementScore > 100
    ) {

      movementScore = 100;
    }
  }

  // ===================================================
  // SpO2 TEST VALUE
  // ===================================================

  if (
    millis() -
    lastSpO2Update >=
    3000
  ) {

    int change =
      random(-1, 2);

    spo2Value +=
      change;

    if (
      spo2Value > 99
    ) {

      spo2Value = 99;
    }

    if (
      spo2Value < 95
    ) {

      spo2Value = 95;
    }

    lastSpO2Update =
      millis();
  }

  // ===================================================
  // ACTIVITY
  // ===================================================

  String activityStatus =
    "NORMAL";

  if (mpuOK) {

    if (
      totalAcceleration > 12.0
    ) {

      activityStatus =
        "HIGH";

    } else if (
      totalAcceleration > 10.5
    ) {

      activityStatus =
        "MODERATE";

    } else {

      activityStatus =
        "NORMAL";
    }
  }

  // ===================================================
  // SERIAL DISPLAY
  // ===================================================

  static unsigned long lastDisplay =
    0;

  if (
    millis() -
    lastDisplay >=
    1000
  ) {

    lastDisplay =
      millis();

    Serial.println();

    Serial.println(
      "========================================"
    );

    Serial.println(
      "        MATERNAL HEALTH DATA"
    );

    Serial.println(
      "========================================"
    );

    // Temperature

    if (
      !isnan(temperature)
    ) {

      Serial.print(
        "Temperature : "
      );

      Serial.print(
        temperature,
        1
      );

      Serial.println(
        " °C"
      );

    } else {

      Serial.println(
        "Temperature : --"
      );
    }

    // Humidity

    if (
      !isnan(humidity)
    ) {

      Serial.print(
        "Humidity    : "
      );

      Serial.print(
        humidity,
        1
      );

      Serial.println(
        " %"
      );

    } else {

      Serial.println(
        "Humidity    : --"
      );
    }

    // Heart Rate

    if (
      BPM >= MIN_BPM &&
      BPM <= MAX_BPM
    ) {

      Serial.print(
        "Heart Rate  : "
      );

      Serial.print(
        BPM
      );

      Serial.println(
        " BPM"
      );

    } else {

      Serial.println(
        "Heart Rate  : Measuring..."
      );
    }

    // SpO2

    Serial.print(
      "SpO2        : "
    );

    Serial.print(
      spo2Value
    );

    Serial.println(
      " % (TEST)"
    );

    // Movement

    if (mpuOK) {

      Serial.print(
        "Movement    : "
      );

      Serial.print(
        movementScore
      );

      Serial.println(
        " / 100"
      );

      Serial.print(
        "Activity    : "
      );

      Serial.println(
        activityStatus
      );

    } else {

      Serial.println(
        "Motion      : --"
      );
    }

    Serial.println(
      "----------------------------------------"
    );
  }

  // ===================================================
  // SEND TO SERVER EVERY 2 SECONDS
  // ===================================================

  if (
    millis() -
    lastServerSend >=
    SERVER_INTERVAL
  ) {

    lastServerSend =
      millis();

    sendDataToServer(
      temperature,
      humidity,
      BPM,
      spo2Value,
      movementScore
    );
  }
}