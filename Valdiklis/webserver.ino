#include <WiFi.h>
#include <WebServer.h>
#include <PubSubClient.h>
#include <Arduino_JSON.h>

#define PAGE_HOME     0
#define PAGE_CLOUD    1
#define PAGE_LOCAL    2
#define PAGE_CONNECT  3
#define PAGE_MQTT     4

//------------- Variables

char** access_points = NULL;;
int ap_n = 0;

const char* ssid = "ESP32";
const char* password = "12345678";

const char* serial = "64321234";
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;


//------------- Library variables

IPAddress local_ip(192,168,1,1);
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);

WebServer server(80);
WiFiClient espClient;
PubSubClient client(espClient);

//------------- Prototypes

void scanNetwork(int *n);


//------------- Main

void setup() {
  Serial.begin(115200);

  WiFi.softAP(ssid, password);
  WiFi.softAPConfig(local_ip, gateway, subnet);
  delay(100);
  
  server.on("/", handle_OnConnect);
  server.on("/cloud", handle_cloudPage);
  server.on("/local", handle_localPage);
  server.on("/scan", handle_scan);
  server.on("/connect", handle_connect);
  server.on("/mqtt", handle_mqtt);
  server.onNotFound(handle_NotFound);
  
  server.begin();
  client.setCallback(callback);
  
  Serial.println("Device has been started");
}
void loop() {
  server.handleClient();
}


//------------- Functions

void handle_OnConnect() {
  Serial.println("User connected");
  server.send(200, "text/html", SendHTML(PAGE_HOME, ""));
}

void handle_cloudPage() {
  server.send(200, "text/html", SendHTML(PAGE_CLOUD, "")); 
}

void handle_localPage() {
  server.send(200, "text/html", SendHTML(PAGE_LOCAL, "")); 
}

void handle_NotFound() {
  server.send(404, "text/plain", "Not found");
}

void handle_scan(){
  if (server.hasArg("page") && server.arg("page") == "local") {
    scanNetwork(&ap_n);
    server.send(200, "text/html", SendHTML(PAGE_LOCAL, ""));
    return;
  }
  
  scanNetwork(&ap_n);
  server.send(200, "text/html", SendHTML(PAGE_CLOUD, "")); 
}

void handle_connect() {
  Serial.println(server.arg("ssid"));
  
  if (server.hasArg("password") && server.hasArg("ssid")) {
    connectToWiFi(server.arg("ssid"), server.arg("password"));
  }
  
  server.send(200, "text/html", SendHTML(PAGE_CONNECT, server.arg("ssid")));
}

void handle_mqtt() {
  Serial.println(server.arg("ssid"));
  
  if (server.hasArg("password") && server.hasArg("ssid") && server.hasArg("broker"), server.hasArg("port")) {
    connectToBroker(server.arg("ssid"), server.arg("password"), server.arg("broker"), server.arg("port"));
  }
  
  server.send(200, "text/html", SendHTML(PAGE_MQTT, server.arg("ssid")));
}

String SendHTML(int page, String param){
  String ptr = "<!DOCTYPE html> <html>\n";
  ptr +="<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">\n";
  ptr +="<meta charset=\"UTF-8\">";
  ptr +="<title>Gyvūnų maitinimo sistemos konfigūracija</title>\n";
  ptr +="<style>html { font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;}\n";
  ptr +="body{margin-top: 50px;} h1 {color: #444444;margin: 50px auto 30px;} h3 {color: #444444;margin-bottom: 50px;}\n";
  ptr +=".button {display: block;background-color: #3498db;width: 90%;border: none;color: white;padding: 13px 30px;text-decoration: none;font-size: 25px;margin: 0px auto 35px;cursor: pointer;border-radius: 4px;}\n";
  ptr +=".button-wifi {display: block;background-color: #c4c4c4;width: 80%;border: none;color: white;padding: 13px 30px;text-decoration: none;font-size: 25px;margin: 0px auto 35px;cursor: pointer;border-radius: 4px;}\n";
  ptr +=".input {display: block;width: 200px;padding: 5px;margin: 10px auto;}\n";
  ptr +=".button-connect {display: block;background-color: #3498db;width: 200px;border: none;color: white;padding: 13px 30px;font-size: 25px;margin: 0px auto 35px;cursor: pointer;border-radius: 4px;}\n";
  ptr +="p {font-size: 14px;color: #888;margin-bottom: 10px;}\n";
  ptr +="</style>\n";
  ptr +="</head>\n";

  ptr +="<body>\n";
  ptr +="<h1>Gyvūnų maitinimo sistemos pradinė konfigūracija</h1>\n";

  switch(page) {
    case PAGE_HOME:
      ptr +="<h3>Pasirinkite įrenginio veikimo rėžimą</h3>\n";
      ptr +="<p>Pasirinkus duomenis debesyse jums reikės prisijungti prie WiFi tinklo ir tada programėlėje nuskenuoti/įrašyti serijinį numerį</p><a class=\"button\" href=\"/cloud\">Duomenys debesije</a>\n";
      ptr +="<p>Pasirinkus vietinį tinklą jūs turėsite sukonfiguruoti MQTT servisą maršrutizatoriuje kuris bus naudojamas kaip serveris</p><a class=\"button\" href=\"/local\">Vietinis tinklas</a>\n";
      break;
    case PAGE_CLOUD:
      ptr +="<h3>Skenuokite tinklą norėdami prisijungti prie WiFi</h3>\n";
      ptr +="<a class=\"button\" href=\"/scan\">Skenuoti</a>\n";

      for(int i = 0; i < ap_n; i++) {
        ptr +="<a class=\"button-wifi\" href=\"/connect?ssid=";
        ptr +=urlencode(access_points[i]);
        ptr +="\">";
        ptr +=access_points[i];
        ptr +="</a><br>";
      }
      break;
    case PAGE_CONNECT:
      ptr +="<h3>Įrašykite belaidžio tinklo slaptažodį</h3>\n";
      ptr +="<form action=\"/connect\">";
      ptr +="<input class=\"input\" readonly type=\"text\" name=\"ssid\" value=\"";
      ptr +=param;
      ptr +="\">";
      ptr +="<input class=\"input\" type=\"password\" name=\"password\" placeholder=\"Slaptažodis\">";
      ptr +="<input class=\"button-connect\" type=\"submit\" value=\"Prisijungti\">";
      ptr +="</form>";
      break;
    case PAGE_LOCAL:
      ptr +="<h3>Skenuokite tinklą norėdami prisijungti prie WiFi</h3>\n";
      ptr +="<a class=\"button\" href=\"/scan?page=local\">Skenuoti</a>\n";

      for(int i = 0; i < ap_n; i++) {
        ptr +="<a class=\"button-wifi\" href=\"/mqtt?ssid=";
        ptr +=urlencode(access_points[i]);
        ptr +="\">";
        ptr +=access_points[i];
        ptr +="</a><br>";
      }
      break;
    case PAGE_MQTT:
      ptr +="<h3>Įrašykite belaidžio tinklo slaptažodį bei MQTT serverio IP adresą</h3>\n";
      ptr +="<form action=\"/mqtt\">";
      ptr +="<input class=\"input\" readonly type=\"text\" name=\"ssid\" value=\"";
      ptr +=param;
      ptr +="\">";
      ptr +="<input class=\"input\" type=\"password\" name=\"password\" placeholder=\"Slaptažodis\">";
      ptr +="<input class=\"input\" type=\"text\" name=\"broker\" placeholder=\"MQTT serverio adresas\">";
      ptr +="<input class=\"input\" type=\"number\" name=\"port\" placeholder=\"MQTT serverio prievadas\">";
      ptr +="<input class=\"button-connect\" type=\"submit\" value=\"Prisijungti\">";
      ptr +="</form>";
      break;
  }

  ptr +="</body>\n";
  ptr +="</html>\n";
  return ptr;
}

void scanNetwork(int *n) {
  *n = WiFi.scanNetworks();
  
  if(n > 0) {
    access_points = (char**) malloc(sizeof(char*) * *n);
    for (int i = 0; i < *n; ++i) {
      access_points[i] = (char*) malloc(sizeof(char) * 24);
      strcpy(access_points[i], WiFi.SSID(i).c_str());
    }
  }
}

void connectToWiFi(String ssid, String password) {
  int count = 0;
  WiFi.begin(ssid.c_str(), password.c_str());
  while(WiFi.status() != WL_CONNECTED) {
    if(count >= 10) {
        Serial.println("Connecting to WiFi failed");
        return;
    }

    Serial.println("Connecting to WiFi...");
    count++;
    delay(1000);
  }

  Serial.println("Connected to WiFi");

  client.setServer(mqttServer, mqttPort);

  if(!client.connected()) {
    reconnect();
  }

  while(client.connected()) {
    client.loop();
  
    char topicSub[48];
    sprintf(topicSub, "bak/feeder-%s/action", serial);
    client.subscribe(topicSub);
    delay(1000);
  }
}

String urlencode(String str)
{
    String encodedString = "";
    char c;
    char code0;
    char code1;
    char code2;
    for (int i = 0; i < str.length(); i++){
      c=str.charAt(i);
      if (c == ' '){
        encodedString += '+';
      } else if (isalnum(c)){
        encodedString += c;
      } else{
        code1 = (c & 0xf)+'0';
        if ((c & 0xf) > 9){
            code1 = (c & 0xf) - 10 + 'A';
        }
        c = (c>>4) & 0xf;
        code0 = c+'0';
        if (c > 9){
            code0 = c - 10 + 'A';
        }
        code2 = '\0';
        encodedString += '%';
        encodedString += code0;
        encodedString +=code1;
        //encodedString += code2;
      }
      yield();
    }
    return encodedString;
}

void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!client.connected()) {
      String clientId = "ESP32Client-";
      clientId += String(random(0xffff), HEX);
      
      if (client.connect(clientId.c_str())) {
        Serial.println("Connected to MQTT Broker");
      }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  JSONVar json = JSON.parse((char *)payload);
  if (JSON.typeof(json) == "undefined") {
    Serial.println("Parsing input failed!");
    return;
  }

  if(strcmp((const char *)json[0], "feed") == 0) {
    int food = (int)json[1];
    Serial.printf("%s with %d amount", (const char *)json[0], food);
  }
  if(strcmp((const char *)json[0], "food_left") == 0) {
    Serial.printf("%d food left", 10);
  }
  if(strcmp((const char *)json[0], "weight") == 0) {
    int weight = (int)json[1];
    Serial.printf("set %d weight", weight);
  }
}

void connectToBroker(String ssid, String password, String broker, String port) {
  int count = 0;
  WiFi.begin(ssid.c_str(), password.c_str());
  while(WiFi.status() != WL_CONNECTED) {
    if(count >= 10) {
        Serial.println("Connecting to WiFi failed");
        return;
    }

    Serial.println("Connecting to WiFi...");
    count++;
    delay(1000);
  }

  Serial.println("Connected to WiFi");

  client.setServer(broker.c_str(), atoi(port.c_str()));

  if(!client.connected()) {
    reconnect();
  }

  char topicSub[48];
  sprintf(topicSub, "bak/feeder-%s/action", serial);
  client.subscribe(topicSub);
  
  while(client.connected()) {
    client.loop();
  }
}
