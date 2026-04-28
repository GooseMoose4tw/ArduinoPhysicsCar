/*  ___   ___  ___  _   _  ___   ___   ____ ___  ____  
 * / _ \ /___)/ _ \| | | |/ _ \ / _ \ / ___) _ \|    \ 
 *| |_| |___ | |_| | |_| | |_| | |_| ( (__| |_| | | | |
 * \___/(___/ \___/ \__  |\___/ \___(_)____)___/|_|_|_|
 *                  (____/ 
 * Osoyoo V2.1 Robot Car — Line Tracking Auto Driving
 *
 * Steering logic:
 *   S2 (center) on                  → drive straight
 *   S1 or S3 (inner) on             → gentle correction, both wheels running,
 *                                      inner side slowed to steer back to center
 *   S0 or S4 (outer / far) on only  → sharp correction, opposing wheel stopped,
 *                                      one wheel drives the turn
 *   All off                         → line lost, stop
 *   All on                          → stop line, stop
 */

// ── Line sensor pins (left → right) ──────────────────────────
#define LFSensor_0 A0   // far-left
#define LFSensor_1 A1   // inner-left
#define LFSensor_2 A2   // center
#define LFSensor_3 A3   // inner-right
#define LFSensor_4 A4   // far-right

// ── Speed constants ───────────────────────────────────────────
#define FAST_SPEED   150   // normal straight speed
#define GENTLE_SPEED  80   // inner wheel speed during gentle correction
// During sharp correction the opposing wheel is stopped (0)

// ── Motor driver pins (L298N) ─────────────────────────────────
#define speedPinR         9   // Right PWM  → ENA
#define RightMotorDirPin1 12  // Right dir  → IN1
#define RightMotorDirPin2 11  // Right dir  → IN2

#define speedPinL         6   // Left PWM   → ENB
#define LeftMotorDirPin1  7   // Left dir   → IN3
#define LeftMotorDirPin2  8   // Left dir   → IN4

// ── Motor helpers ─────────────────────────────────────────────
void set_Motorspeed(int speed_L, int speed_R) {
  analogWrite(speedPinL, speed_L);
  analogWrite(speedPinR, speed_R);
}

void go_Forward() {
  digitalWrite(RightMotorDirPin1, HIGH);
  digitalWrite(RightMotorDirPin2, LOW);
  digitalWrite(LeftMotorDirPin1,  HIGH);
  digitalWrite(LeftMotorDirPin2,  LOW);
}

void stop_Stop() {
  digitalWrite(RightMotorDirPin1, LOW);
  digitalWrite(RightMotorDirPin2, LOW);
  digitalWrite(LeftMotorDirPin1,  LOW);
  digitalWrite(LeftMotorDirPin2,  LOW);
  set_Motorspeed(0, 0);
}

// ── Sensor reading ────────────────────────────────────────────
char sensor[5];
String read_sensor_values() {
  int sensorvalue = 32;
  sensor[0] = !digitalRead(LFSensor_0);
  sensor[1] = !digitalRead(LFSensor_1);
  sensor[2] = !digitalRead(LFSensor_2);
  sensor[3] = !digitalRead(LFSensor_3);
  sensor[4] = !digitalRead(LFSensor_4);
  sensorvalue += sensor[0]*16 + sensor[1]*8 + sensor[2]*4 + sensor[3]*2 + sensor[4];
  String senstr = String(sensorvalue, BIN);
  senstr = senstr.substring(1, 6);
  return senstr;
}

// ── Line following ────────────────────────────────────────────
void auto_tracking() {
  String s = read_sensor_values();
  Serial.println(s);

  bool s0 = (s[0] == '1');  // far-left
  bool s1 = (s[1] == '1');  // inner-left
  bool s2 = (s[2] == '1');  // center
  bool s3 = (s[3] == '1');  // inner-right
  bool s4 = (s[4] == '1');  // far-right

  // ── Stop line ───────────────────────────────────────────────
  if (s0 && s1 && s2 && s3 && s4) {
    stop_Stop();
    return;
  }

  // ── Center sensor on → drive straight ───────────────────────
  if (s2) {
    go_Forward();
    set_Motorspeed(FAST_SPEED, FAST_SPEED);
    return;
  }

  // ── Inner-left (S1) on → gentle right correction ────────────
  // Line is slightly left, slow the left wheel to steer back
  if (s1 && !s0) {
    go_Forward();
    set_Motorspeed(GENTLE_SPEED, FAST_SPEED);
    return;
  }

  // ── Inner-right (S3) on → gentle left correction ────────────
  // Line is slightly right, slow the right wheel to steer back
  if (s3 && !s4) {
    go_Forward();
    set_Motorspeed(FAST_SPEED, GENTLE_SPEED);
    return;
  }

  // ── Far-left (S0) on → sharp right turn ─────────────────────
  // Line is far left, stop the left wheel, drive right wheel only
  if (s0) {
    go_Forward();
    set_Motorspeed(0, FAST_SPEED);
    return;
  }

  // ── Far-right (S4) on → sharp left turn ─────────────────────
  // Line is far right, stop the right wheel, drive left wheel only
  if (s4) {
    go_Forward();
    set_Motorspeed(FAST_SPEED, 0);
    return;
  }

  // ── Line lost → stop ─────────────────────────────────────────
  stop_Stop();
}

// ── Arduino entry points ──────────────────────────────────────
void setup() {
  pinMode(RightMotorDirPin1, OUTPUT);
  pinMode(RightMotorDirPin2, OUTPUT);
  pinMode(speedPinR,         OUTPUT);
  pinMode(LeftMotorDirPin1,  OUTPUT);
  pinMode(LeftMotorDirPin2,  OUTPUT);
  pinMode(speedPinL,         OUTPUT);

  stop_Stop();
  Serial.begin(9600);
}

void loop() {
  auto_tracking();
}
