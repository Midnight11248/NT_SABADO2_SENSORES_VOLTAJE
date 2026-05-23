/*
 * ================================================================
 * SENSORESVOLT — Firmware ESP32
 * Backend: Java Spring Boot  →  POST /mediciones/ingresar
 * ================================================================
 *
 * DIFERENCIAS vs ESP8266:
 *   - ADC de 12 bits (0-4095) en lugar de 10 bits (0-1023)
 *   - Voltaje referencia ADC: 3.3 V
 *   - Librería WiFi nativa de ESP32
 *   - WebServer en lugar de ESP8266WebServer
 *   - Preferences en lugar de LittleFS para persistencia simple
 *   - WiFiManager compatible con ESP32
 *
 * LIBRERIAS REQUERIDAS (Arduino IDE → Gestor de librerías):
 *   - WiFiManager          by tzapu  (compatible con ESP32)
 *   - ArduinoJson          by Benoit Blanchon  (v6.x)
 *   - UniversalTelegramBot by Brian Lough
 *
 * PRIMERA CONFIGURACION:
 *   1. Sube el sketch al ESP32.
 *   2. Conéctate al AP "SENSOR_CONFIG" (contraseña: 12345678).
 *   3. Configura el WiFi en el portal cautivo.
 *   4. Ve a  http://[IP_DEL_SENSOR]/config
 * ================================================================
 */

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <DNSServer.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include <Preferences.h>           // Persistencia en NVS (no-volatile storage)
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>

// ── Pines y parámetros del divisor de voltaje ─────────────────
// En ESP32 el ADC es de 12 bits → resolución 4095
const int   SENSOR_PIN      = 34;   // GPIO34 — entrada analógica (solo lectura)
const float R1              = 72000.0;
const float R2              = 7500.0;
const float ADC_MAX_VOLTAGE = 3.3;
const int   ADC_RESOLUTION  = 4095; // 12 bits en ESP32

// ── Servidor web local ─────────────────────────────────────────
WebServer server(80);

// ── Persistencia con Preferences (NVS) ────────────────────────
Preferences prefs;

// ── Estructura de configuración ───────────────────────────────
struct Config {
  char  sensorName[32];
  char  sensorToken[64];
  char  serverUrl[128];
  long  sendInterval;
  float alertThresholdMin;
  bool  telegramAlertsEnabled;
  char  telegramBotToken[64];
  char  telegramChatID[64];
  long  telegramAlertInterval;
};

Config config;

// ── Valores por defecto ────────────────────────────────────────
// *** CAMBIA ESTOS VALORES ANTES DE SUBIR ***
const char* DEFAULT_SERVER_URL   = "http://192.168.1.100:8080/mediciones/ingresar";
const char* DEFAULT_SENSOR_NAME  = "Mi_Sensor_ESP32";
const char* DEFAULT_SENSOR_TOKEN = "REEMPLAZA_CON_TU_TOKEN";
long  DEFAULT_SEND_INTERVAL      = 60000;
float DEFAULT_ALERT_MIN          = 10.0;
bool  DEFAULT_TG_ENABLED         = false;
long  DEFAULT_TG_INTERVAL        = 300000;

// ── Variables de control Telegram ─────────────────────────────
unsigned long lastTelegramAlertTime = 0;
long          lastUpdateID          = 0;
const long    TG_CHECK_INTERVAL     = 10000;
unsigned long lastTelegramCheck     = 0;

WiFiClientSecure  secured_client;
UniversalTelegramBot* bot = nullptr;

// ==============================================================
// LECTURA DEL SENSOR
// ESP32: el ADC puede tener no-linealidad cerca de los extremos.
// Se hace un promedio de 10 lecturas para mayor estabilidad.
// ==============================================================
float leerVoltaje() {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(SENSOR_PIN);
    delay(2);
  }
  float raw  = sum / 10.0;
  float vout = (raw * ADC_MAX_VOLTAGE) / ADC_RESOLUTION;
  float vin  = vout / (R2 / (R1 + R2));
  return vin;
}

// ==============================================================
// PERSISTENCIA — Preferences (NVS)
// ==============================================================
void loadConfig() {
  prefs.begin("sensor_cfg", true);  // true = solo lectura
  prefs.getString("sensorName",       config.sensorName,       sizeof(config.sensorName));
  prefs.getString("sensorToken",      config.sensorToken,      sizeof(config.sensorToken));
  prefs.getString("serverUrl",        config.serverUrl,        sizeof(config.serverUrl));
  prefs.getString("tgBotToken",       config.telegramBotToken, sizeof(config.telegramBotToken));
  prefs.getString("tgChatID",         config.telegramChatID,   sizeof(config.telegramChatID));
  config.sendInterval          = prefs.getLong("sendInterval",   DEFAULT_SEND_INTERVAL);
  config.alertThresholdMin     = prefs.getFloat("alertMin",      DEFAULT_ALERT_MIN);
  config.telegramAlertsEnabled = prefs.getBool("tgEnabled",      DEFAULT_TG_ENABLED);
  config.telegramAlertInterval = prefs.getLong("tgInterval",     DEFAULT_TG_INTERVAL);
  prefs.end();

  // Si no hay valores guardados, poner defaults
  if (strlen(config.sensorName)  == 0) strlcpy(config.sensorName,       DEFAULT_SENSOR_NAME,   sizeof(config.sensorName));
  if (strlen(config.sensorToken) == 0) strlcpy(config.sensorToken,      DEFAULT_SENSOR_TOKEN,  sizeof(config.sensorToken));
  if (strlen(config.serverUrl)   == 0) strlcpy(config.serverUrl,        DEFAULT_SERVER_URL,    sizeof(config.serverUrl));

  Serial.println("[Config] Cargada.");
}

bool saveConfig() {
  prefs.begin("sensor_cfg", false);  // false = lectura/escritura
  prefs.putString("sensorName",   config.sensorName);
  prefs.putString("sensorToken",  config.sensorToken);
  prefs.putString("serverUrl",    config.serverUrl);
  prefs.putString("tgBotToken",   config.telegramBotToken);
  prefs.putString("tgChatID",     config.telegramChatID);
  prefs.putLong("sendInterval",   config.sendInterval);
  prefs.putFloat("alertMin",      config.alertThresholdMin);
  prefs.putBool("tgEnabled",      config.telegramAlertsEnabled);
  prefs.putLong("tgInterval",     config.telegramAlertInterval);
  prefs.end();
  Serial.println("[Config] Guardada en NVS.");
  return true;
}

// ==============================================================
// ENVIO AL SERVIDOR JAVA
// Mismo endpoint que ESP8266: POST /mediciones/ingresar
// ==============================================================
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Sin WiFi.");
    return;
  }

  float vin = leerVoltaje();
  Serial.printf("[Sensor] Voltaje: %.3f V\n", vin);

  HTTPClient http;
  http.begin(config.serverUrl);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  char body[200];
  snprintf(body, sizeof(body),
    "sensor_token=%s&voltaje=%.4f",
    config.sensorToken, vin);

  int code = http.POST(body);

  if (code == HTTP_CODE_OK || code == HTTP_CODE_CREATED) {
    String resp = http.getString();
    Serial.println("[HTTP] OK: " + resp);
  } else {
    Serial.printf("[HTTP] Error %d: %s\n", code, http.errorToString(code).c_str());
  }
  http.end();

  // ── Lógica de alerta Telegram ──────────────────────────────
  if (config.telegramAlertsEnabled && bot) {
    if (vin < config.alertThresholdMin) {
      unsigned long now = millis();
      if (now - lastTelegramAlertTime >= (unsigned long)config.telegramAlertInterval) {
        String msg = "🔴🔋 ALERTA: " + String(config.sensorName);
        msg += " → " + String(vin, 2) + " V";
        msg += " (umbral: " + String(config.alertThresholdMin, 2) + " V)";
        bot->sendMessage(config.telegramChatID, msg);
        lastTelegramAlertTime = now;
        Serial.println("[Telegram] Alerta enviada.");
      }
    } else {
      lastTelegramAlertTime = 0;
    }
  }
}

// ==============================================================
// TELEGRAM — Mensajes entrantes
// ==============================================================
void handleTelegramMessages(int n) {
  for (int i = 0; i < n; i++) {
    String chat_id = bot->messages[i].chat_id;
    String text    = bot->messages[i].text;
    String from    = bot->messages[i].from_name;

    if (chat_id != String(config.telegramChatID)) {
      bot->sendMessage(chat_id, "⛔ Acceso no autorizado.");
      continue;
    }

    if (text == "/start" || text == "/help") {
      String msg = "🤖 Hola, " + from + "!\n";
      msg += "/estado — Voltaje actual\n";
      msg += "/info   — Info del sensor\n";
      msg += "/help   — Esta ayuda";
      bot->sendMessage(chat_id, msg);

    } else if (text == "/estado") {
      float v = leerVoltaje();
      String msg = "🔋 " + String(config.sensorName) + ": ";
      msg += String(v, 2) + " V";
      if (config.telegramAlertsEnabled) {
        msg += (v < config.alertThresholdMin)
          ? "\n🔴 Por debajo del umbral (" + String(config.alertThresholdMin, 2) + " V)"
          : "\n🟢 Dentro del rango normal";
      }
      bot->sendMessage(chat_id, msg);

    } else if (text == "/info") {
      String msg = "ℹ️ Sensor: " + String(config.sensorName) + "\n";
      msg += "🌐 Servidor: " + String(config.serverUrl) + "\n";
      msg += "⏱ Intervalo: " + String(config.sendInterval / 1000) + "s\n";
      msg += "📶 IP: " + WiFi.localIP().toString();
      bot->sendMessage(chat_id, msg);

    } else {
      bot->sendMessage(chat_id, "❓ Comando no reconocido. Usa /help");
    }
  }
}

// ==============================================================
// SERVIDOR WEB LOCAL — Página de configuración
// ==============================================================
void handleConfig() {
  String html = "<!DOCTYPE html><html lang='es'><head>"
    "<meta charset='UTF-8'>"
    "<meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>Config Sensor ESP32</title>"
    "<style>"
    "body{font-family:monospace;background:#020917;color:#e8f4fd;margin:0;padding:20px}"
    "h2{color:#00d4ff;letter-spacing:.1em}"
    "label{display:block;color:#7eb8d4;font-size:.8rem;margin:.8rem 0 .2rem}"
    "input[type=text],input[type=number]{width:100%;padding:.55rem;background:#0a1f45;"
    "border:1px solid rgba(0,212,255,.35);border-radius:5px;color:#e8f4fd;"
    "font-family:monospace;box-sizing:border-box}"
    "input:focus{border-color:#00d4ff;outline:none}"
    ".row{display:flex;align-items:center;gap:.5rem;margin:.8rem 0}"
    "button{margin-top:1.2rem;width:100%;padding:.75rem;background:#00d4ff;"
    "color:#020917;border:none;border-radius:5px;font-family:monospace;"
    "font-weight:700;font-size:.95rem;cursor:pointer}"
    "button:hover{background:#21a1f1}"
    ".tip{margin-top:1rem;padding:.7rem;background:rgba(0,212,255,.06);"
    "border:1px solid rgba(0,212,255,.2);border-radius:5px;font-size:.75rem;"
    "color:#7eb8d4;line-height:1.5}"
    "code{color:#00d4ff}"
    "</style></head><body>"
    "<h2>⚡ SENSORESVOLT ESP32</h2>"
    "<form method='POST' action='/save'>";

  auto field = [&](const char* lbl, const char* name, const char* val, const char* type = "text") {
    html += "<label>" + String(lbl) + "</label>";
    html += "<input type='" + String(type) + "' name='" + String(name) + "' value='" + String(val) + "' required>";
  };

  char si[12], atm[12], tai[12];
  snprintf(si,  sizeof(si),  "%ld",  config.sendInterval);
  snprintf(atm, sizeof(atm), "%.1f", config.alertThresholdMin);
  snprintf(tai, sizeof(tai), "%ld",  config.telegramAlertInterval);

  field("Nombre del Sensor",         "sensorName",            config.sensorName);
  field("Token del Sensor",          "sensorToken",           config.sensorToken);
  field("URL Servidor Java",         "serverUrl",             config.serverUrl);
  field("Intervalo Envío (ms)",      "sendInterval",          si,  "number");
  field("Telegram Bot Token",        "telegramBotToken",      config.telegramBotToken);
  field("Telegram Chat ID",          "telegramChatID",        config.telegramChatID);
  field("Umbral Mínimo Voltaje (V)", "alertThresholdMin",     atm, "number");
  field("Intervalo Alerta TG (ms)",  "telegramAlertInterval", tai, "number");

  html += "<div class='row'><input type='checkbox' id='tg' name='telegramAlertsEnabled'";
  if (config.telegramAlertsEnabled) html += " checked";
  html += "><label for='tg' style='margin:0;color:#e8f4fd'>Habilitar alertas Telegram</label></div>";

  html += "<button type='submit'>💾 GUARDAR Y REINICIAR</button>";
  html += "<div class='tip'>El sensor envía a <code>";
  html += config.serverUrl;
  html += "</code><br>parámetros: <code>sensor_token</code> + <code>voltaje</code></div>";
  html += "</form></body></html>";

  server.send(200, "text/html; charset=UTF-8", html);
}

void handleSaveConfig() {
  if (server.hasArg("sensorName"))    strlcpy(config.sensorName,       server.arg("sensorName").c_str(),       sizeof(config.sensorName));
  if (server.hasArg("sensorToken"))   strlcpy(config.sensorToken,      server.arg("sensorToken").c_str(),      sizeof(config.sensorToken));
  if (server.hasArg("serverUrl"))     strlcpy(config.serverUrl,        server.arg("serverUrl").c_str(),        sizeof(config.serverUrl));
  if (server.hasArg("sendInterval"))  config.sendInterval          = server.arg("sendInterval").toInt();
  if (server.hasArg("alertThresholdMin")) config.alertThresholdMin = server.arg("alertThresholdMin").toFloat();
  if (server.hasArg("telegramBotToken"))  strlcpy(config.telegramBotToken, server.arg("telegramBotToken").c_str(), sizeof(config.telegramBotToken));
  if (server.hasArg("telegramChatID"))    strlcpy(config.telegramChatID,   server.arg("telegramChatID").c_str(),   sizeof(config.telegramChatID));
  config.telegramAlertsEnabled = server.hasArg("telegramAlertsEnabled");
  if (server.hasArg("telegramAlertInterval")) config.telegramAlertInterval = server.arg("telegramAlertInterval").toInt();

  saveConfig();
  server.send(200, "text/html; charset=UTF-8",
    "<html><body style='background:#020917;color:#00d4ff;font-family:monospace;padding:2rem'>"
    "<h2>✅ Guardado. Reiniciando...</h2></body></html>");
  delay(1200);
  ESP.restart();
}

// ==============================================================
// SETUP & LOOP
// ==============================================================
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("\n[Boot] SensoresVolt ESP32 v2.0");

  loadConfig();

  WiFiManager wm;
  wm.setAPCallback([](WiFiManager*) {
    Serial.printf("[WiFi] AP: SENSOR_CONFIG | IP: %s\n",
      WiFi.softAPIP().toString().c_str());
  });
  if (!wm.autoConnect("SENSOR_CONFIG", "12345678")) {
    Serial.println("[WiFi] Fallo. Reiniciando...");
    delay(3000); ESP.restart();
  }
  Serial.printf("[WiFi] Conectado. IP: %s\n", WiFi.localIP().toString().c_str());

  // Telegram
  secured_client.setInsecure();
  if (strlen(config.telegramBotToken) > 0) {
    bot = new UniversalTelegramBot(config.telegramBotToken, secured_client);
    Serial.println("[Telegram] Bot inicializado.");
  }

  server.on("/",       HTTP_GET,  handleConfig);
  server.on("/config", HTTP_GET,  handleConfig);
  server.on("/save",   HTTP_POST, handleSaveConfig);
  server.begin();
  Serial.println("[Web] Activo en: http://" + WiFi.localIP().toString() + "/config");
}

void loop() {
  server.handleClient();

  static unsigned long lastSend = 0;
  if (millis() - lastSend > (unsigned long)config.sendInterval) {
    sendSensorData();
    lastSend = millis();
  }

  if (config.telegramAlertsEnabled && bot) {
    if (millis() - lastTelegramCheck > TG_CHECK_INTERVAL) {
      int n = bot->getUpdates(lastUpdateID + 1);
      if (n > 0) {
        handleTelegramMessages(n);
        lastUpdateID = bot->messages[n - 1].update_id;
      }
      lastTelegramCheck = millis();
    }
  }
}
