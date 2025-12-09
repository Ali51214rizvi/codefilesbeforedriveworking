# detect_and_log.py
import cv2
import mediapipe as mp
import time
import os
import csv
from datetime import datetime

# ---------- SETTINGS ----------
CAM_INDEX = 0               # change if your camera is on another index
MIN_DET_CONF = 0.5          # mediapipe min_detection_confidence (0.0 - 1.0)
MODEL_SELECTION = 0         # 0: short/faster, 1: full-range
COOLDOWN_SECONDS = 5        # how often to log when multiple faces persist
SAVE_DIR = "logs/screenshots"
CSV_PATH = "logs/face_log.csv"
MAX_RUNTIME_SECONDS = None  # set to number (e.g., 120) to auto-stop, or None to keep running
FRAME_WIDTH = 640           # resize width for faster processing (keeps aspect ratio)

# ---------- PREPARE FOLDERS & CSV ----------
os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(os.path.dirname(CSV_PATH) or ".", exist_ok=True)

if not os.path.exists(CSV_PATH):
    with open(CSV_PATH, mode="w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "event", "faces", "image_path"])

# ---------- MEDIAPIPE SETUP ----------
mp_face = mp.solutions.face_detection
mp_draw = mp.solutions.drawing_utils

# ---------- MAIN ----------
def detect_and_log():
    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera index {CAM_INDEX}. Try different index (0,1,...).")
        return

    last_log_time = 0
    start_time = time.time()
    print("[INFO] Starting webcam. Press 'q' to quit.")

    with mp_face.FaceDetection(model_selection=MODEL_SELECTION,
                               min_detection_confidence=MIN_DET_CONF) as detector:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARN] Frame not captured properly. Exiting.")
                break

            # Resize for speed (if frame width greater than desired)
            h, w = frame.shape[:2]
            if w > FRAME_WIDTH:
                scale = FRAME_WIDTH / w
                frame = cv2.resize(frame, (int(w*scale), int(h*scale)))

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = detector.process(rgb)

            face_count = 0
            if results.detections:
                face_count = len(results.detections)
                for det in results.detections:
                    mp_draw.draw_detection(frame, det)

            # Overlay info
            timestamp_text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, f"{timestamp_text}", (10, 20), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, (200,200,200), 1)
            cv2.putText(frame, f"Faces Detected: {face_count}", (10, 45),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            # If multiple faces, log with cooldown
            if face_count > 1:
                now = time.time()
                if now - last_log_time >= COOLDOWN_SECONDS:
                    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"faces_{ts}.jpg"
                    path = os.path.join(SAVE_DIR, filename)
                    cv2.imwrite(path, frame)
                    with open(CSV_PATH, "a", newline="") as f:
                        writer = csv.writer(f)
                        writer.writerow([ts, "multiple_faces", face_count, path])
                    print(f"[LOG] {ts} | multiple_faces | faces={face_count} | {path}")
                    last_log_time = now

            cv2.imshow("Face Detection (Press q to quit)", frame)

            # Key handling
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("[INFO] Manual exit by user.")
                break

            # Auto-stop condition
            if MAX_RUNTIME_SECONDS and (time.time() - start_time) > MAX_RUNTIME_SECONDS:
                print(f"[INFO] Auto timeout reached ({MAX_RUNTIME_SECONDS} sec).")
                break

    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] Program terminated.")

if __name__ == "__main__":
    detect_and_log()
