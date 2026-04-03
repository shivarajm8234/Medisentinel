#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// --- WiFi Credentials ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- MQTT Configuration ---
const char* mqtt_server = "192.168.1.xxx"; // IP of the Mosquitto broker
const int mqtt_port = 1883;

// --- Device Details ---
const String DEVICE_ID = "MED-ESP32-V2-" + String((uint32_t)ESP.getEfuseMac(), HEX);
const char* DEVICE_TYPE = "vitals_tracker";

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void auto_register() {
  // Simple payload to let backend know we exist
  StaticJsonDocument<200> doc;
  doc["device_id"] = DEVICE_ID;
  doc["device_type"] = DEVICE_TYPE;
  doc["status"] = "active";
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  // Publish to auto-registration topic
  String topic = "devices/" + DEVICE_ID + "/status";
  client.publish(topic.c_str(), buffer, true); // Retained message
  Serial.println("Auto-registration payload sent");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Attempt to connect
    if (client.connect(DEVICE_ID.c_str())) {
      Serial.println("connected");
      
      // Auto register on connect
      auto_register();
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 2000) { // Send telemetry every 2 seconds
    lastMsg = now;

    // --- Synthetic Medical/Hardware Data ---
    // In a real device, you would read from sensors like MAX30102 (Heart Rate) or DHT11/BME280 etc.
    float sim_cpu = random(20, 40);
    float sim_temp = 36.5 + (random(-5, 5) / 10.0); // Human body temp range
    int sim_heart_rate = random(60, 100);
    
    StaticJsonDocument<400> doc;
    doc["device_id"] = DEVICE_ID;
    doc["device_type"] = DEVICE_TYPE;
    
    JsonObject network = doc.createNestedObject("network");
    network["bytes_sent"] = random(100, 300);
    network["bytes_received"] = random(100, 300);
    network["packet_rate"] = random(5, 15);
    
    JsonObject metrics = doc.createNestedObject("metrics");
    metrics["cpu"] = sim_cpu;
    metrics["temp"] = sim_temp;
    metrics["heart_rate"] = sim_heart_rate;
    metrics["batt"] = 100 - (millis() / 60000); // drain 1% per minute roughly if simulated
    metrics["errors"] = 0;
    
    char buffer[512];
    serializeJson(doc, buffer);
    
    String topic = "devices/" + DEVICE_ID + "/data";
    client.publish(topic.c_str(), buffer);
    Serial.print("Published to ");
    Serial.print(topic);
    Serial.println(": ");
    Serial.println(buffer);
  }
}
