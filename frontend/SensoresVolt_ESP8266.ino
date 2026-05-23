/*
 * ================================================================
 * SENSORESVOLT — Firmware ESP8266 / NodeMCU
 * Backend: Java Spring Boot  →  POST /mediciones/ingresar
 * ================================================================
 *
 * LIBRERIAS REQUERIDAS (Arduino IDE → Gestor de librerías):
 *   - WiFiManager          by tzapu
 *   - ArduinoJson          by Benoit Blanchon  (v6.x)
 *   - UniversalTelegramBot by Brian Lough
 *
 * PRIMERA CONFIGURACION:
 *   1. Sube el sketch al NodeMCU.
 *   2. Conéctate al AP "SENSOR_CONFIG" (contraseña: 12345678).
 *   3. Configura el WiFi en el portal cautivo.
 *   4. Ve a  http://[IP_DEL_SENSOR]/config  para ingresar:
 *        - Nombre del sensor
 *        - Token (igual al registrado en la plataforma web)
 *        - URL del servidor Java
 *        - Credenciales de Telegram (opcional)
 * ================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <DNSServer.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>

// ── Pines y parámetros del divisor de voltaje ─────────────────
const int   SENSOR_PIN      = A0;
const float R1              = 72000.0;  // Resistencia R1 en ohmios
const float R2              = 7500.0;   // Resistencia R2 en ohmios
const float ADC_MAX_VOLTAGE = 3.3;      // Voltaje referencia ADC ESP8266
const int   ADC_RESOLUTION  = 1023;     // Resolución ADC ESP8266 (10 bits)

// ── Servidor web local del sensor ─────────────────────────────
ESP8266WebServer server(80);

// ── Estructura de configuración persistente ───────────────────
struct Config {
  char  sensorName[32];
  char  sensorToken[64];          // Token igual al registrado en la web
  char  serverUrl[128];           // Ej: http://192.168.1.100:8080/mediciones/ingresar
  long  sendInterval;             // ms entre envíos al servidor
  float alertThresholdMin;        // Voltaje mínimo antes de alertar
  bool  telegramAlertsEnabled;
  char  telegramBotToken[64];
  char  telegramChatID[64];
  long  telegramAlertInterval;    // ms entre alertas repetidas
};

Config config;

// ── Valores por defecto ────────────────────────────────────────
// *** CAMBIA ESTOS VALORES ANTES DE SUBIR ***
const char* DEFAULT_SERVER_URL   = "http://192.168.1.100:8080/mediciones/ingresar";
const char* DEFAULT_SENSOR_NAME  = "Mi_Sensor_01";
const char* DEFAULT_SENSOR_TOKEN = "REEMPLAZA_CON_TU_TOKEN";
long  DEFAULT_SEND_INTERVAL      = 60000;   // 60 segundos
float DEFAULT_ALERT_MIN          = 10.0;
bool  DEFAULT_TG_ENABLED         = false;
long  DEFAULT_TG_INTERVAL        = 300000;  // 5 minutos

// ── Variables de control Telegram ─────────────────────────────
unsigned long lastTelegramAlertTime = 0;
long          lastUpdateID          = 0;
const long    TG_CHECK_INTERVAL     = 10000;
unsigned long lastTelegramCheck     = 0;

WiFiClientSecure  secured_client;
UniversalTelegramBot* bot = nullptr;

// ==============================================================
// LECTURA DEL SENSOR
// ==============================================================
float leerVoltaje() {
  int   raw  = analogRead(SENSOR_PIN);
  float vout = (raw * ADC_MAX_VOLTAGE) / ADC_RESOLUTION;
  float vin  = vout / (R2 / (R1 + R2));
  return vin;
}

// ==============================================================
// PERSISTENCIA — LittleFS
// ==============================================================
bool loadConfig() {
  if (!LittleFS.begin()) { Serial.println("[FS] Error montando LittleFS"); return false; }

  if (LittleFS.exists("/config.json")) {
    File f = LittleFS.open("/config.json", "r");
    if (f) {
      StaticJsonDocument<512> doc;
      if (!deserializeJson(doc, f)) {
        strlcpy(config.sensorName,       doc["sensorName"]          | DEFAULT_SENSOR_NAME,   sizeof(config.sensorName));
        strlcpy(config.sensorToken,      doc["sensorToken"]         | DEFAULT_SENSOR_TOKEN,  sizeof(config.sensorToken));
        strlcpy(config.serverUrl,        doc["serverUrl"]           | DEFAULT_SERVER_URL,     sizeof(config.serverUrl));
        config.sendInterval          = doc["sendInterval"]          | DEFAULT_SEND_INTERVAL;
        config.alertThresholdMin     = doc["alertThresholdMin"]     | DEFAULT_ALERT_MIN;
        config.telegramAlertsEnabled = doc["telegramAlertsEnabled"] | DEFAULT_TG_ENABLED;
        strlcpy(config.telegramBotToken, doc["telegramBotToken"]    | "",                     sizeof(config.telegramBotToken));
        strlcpy(config.telegramChatID,   doc["telegramChatID"]      | "",                     sizeof(config.telegramChatID));
        config.telegramAlertInterval = doc["telegramAlertInterval"] | DEFAULT_TG_INTERVAL;
        f.close();
        Serial.println("[Config] Cargada desde LittleFS.");
        return true;
      }
      f.close();
    }
  }
  // Defaults
  strlcpy(config.sensorName,       DEFAULT_SENSOR_NAME,   sizeof(config.sensorName));
  strlcpy(config.sensorToken,      DEFAULT_SENSOR_TOKEN,  sizeof(config.sensorToken));
  strlcpy(config.serverUrl,        DEFAULT_SERVER_URL,    sizeof(config.serverUrl));
  config.sendInterval          = DEFAULT_SEND_INTERVAL;
  config.alertThresholdMin     = DEFAULT_ALERT_MIN;
  config.telegramAlertsEnabled = DEFAULT_TG_ENABLED;
  config.telegramBotToken[0]   = '\0';
  config.telegramChatID[0]     = '\0';
  config.telegramAlertInterval = DEFAULT_TG_INTERVAL;
  return false;
}

bool saveConfig() {
  if (!LittleFS.begin()) return false;
  File f = LittleFS.open("/config.json", "w");
  if (!f) return false;

  StaticJsonDocument<512> doc;
  doc["sensorName"]          = config.sensorName;
  doc["sensorToken"]         = config.sensorToken;
  doc["serverUrl"]           = config.serverUrl;
  doc["sendInterval"]        = config.sendInterval;
  doc["alertThresholdMin"]   = config.alertThresholdMin;
  doc["telegramAlertsEnabled"] = config.telegramAlertsEnabled;
  doc["telegramBotToken"]    = config.telegramBotToken;
  doc["telegramChatID"]      = config.telegramChatID;
  doc["telegramAlertInterval"] = config.telegramAlertInterval;

  bool ok = serializeJson(doc, f) > 0;
  f.close();
  Serial.println(ok ? "[Config] Guardada." : "[Config] Error al guardar.");
  return ok;
}

// ==============================================================
// ENVIO AL SERVIDOR JAVA
// Endpoint: POST /mediciones/ingresar
// Parámetros form-urlencoded: sensor_token + voltaje
// ==============================================================
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Sin WiFi.");
    return;
  }

  float vin = leerVoltaje();
  Serial.printf("[Sensor] Voltaje: %.3f V\n", vin);

  HTTPClient http;
  WiFiClient client;
  http.begin(client, config.serverUrl);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  // El backend Java espera estos dos parámetros exactamente
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
    "<title>Config Sensor</title>"
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
    "<h2>⚡ SENSORESVOLT CONFIG</h2>"
    "<form method='POST' action='/save'>";

  // Campos del formulario
  auto field = [&](const char* lbl, const char* id, const char* val, const char* type = "text") {
    html += "<label>" + String(lbl) + "</label>";
    html += "<input type='" + String(type) + "' name='" + String(id) + "' value='" + String(val) + "' required>";
  };

  char si[12], atm[12], tai[12];
  snprintf(si,  sizeof(si),  "%ld",  config.sendInterval);
  snprintf(atm, sizeof(atm), "%.1f", config.alertThresholdMin);
  snprintf(tai, sizeof(tai), "%ld",  config.telegramAlertInterval);

  field("Nombre del Sensor",            "sensorName",            config.sensorName);
  field("Token del Sensor",             "sensorToken",           config.sensorToken);
  field("URL Servidor Java",            "serverUrl",             config.serverUrl);
  field("Intervalo Envío (ms)",         "sendInterval",          si,  "number");
  field("Telegram Bot Token",           "telegramBotToken",      config.telegramBotToken);
  field("Telegram Chat ID",             "telegramChatID",        config.telegramChatID);
  field("Umbral Mínimo Voltaje (V)",    "alertThresholdMin",     atm, "number");
  field("Intervalo Alerta TG (ms)",     "telegramAlertInterval", tai, "number");

  html += "<div class='row'>"
    "<input type='checkbox' id='tg' name='telegramAlertsEnabled'";
  if (config.telegramAlertsEnabled) html += " checked";
  html += "><label for='tg' style='margin:0;color:#e8f4fd'>Habilitar alertas Telegram</label></div>";

  html += "<button type='submit'>💾 GUARDAR Y REINICIAR</button>";
  html += "<div class='tip'>El sensor envía a <code>";
  html += config.serverUrl;
  html += "</code><br>con parámetros: <code>sensor_token</code> + <code>voltaje</code></div>";
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

  if (saveConfig()) {
    server.send(200, "text/html; charset=UTF-8",
      "<html><body style='background:#020917;color:#00d4ff;font-family:monospace;padding:2rem'>"
      "<h2>✅ Guardado. Reiniciando...</h2></body></html>");
    delay(1200);
    ESP.restart();
  } else {
    server.sendHeader("Location", "/config?error=1");
    server.send(303);
  }
}

// ==============================================================
// SETUP & LOOP
// ==============================================================
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("\n[Boot] SensoresVolt ESP8266 v2.0");

  loadConfig();

  // WiFiManager — crea AP de configuración inicial
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
  secured_client.setInsecure();  // Sin validación de certificado (entorno local)
  if (strlen(config.telegramBotToken) > 0) {
    bot = new UniversalTelegramBot(config.telegramBotToken, secured_client);
    Serial.println("[Telegram] Bot inicializado.");
  }

  // Servidor web local
  server.on("/",       HTTP_GET,  handleConfig);
  server.on("/config", HTTP_GET,  handleConfig);
  server.on("/save",   HTTP_POST, handleSaveConfig);
  server.begin();
  Serial.println("[Web] Activo en: http://" + WiFi.localIP().toString() + "/config");
}

void loop() {
  server.handleClient();

  // Envío periódico al servidor Java
  static unsigned long lastSend = 0;
  if (millis() - lastSend > (unsigned long)config.sendInterval) {
    sendSensorData();
    lastSend = millis();
  }

  // Chequeo de mensajes Telegram
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
