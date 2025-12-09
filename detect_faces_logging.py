import cv2
import mediapipe as mp
import time
import os
import csv
from datetime import datetime

# Initialize mediapipe
mp_face = mp.solutions.face_detection
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)
face_detection = mp_face.FaceDetection(min_detection_confidence=0.5)

# Create log folder
os.makedirs("logs/screenshots", exist_ok=True)

# CSV setup
csv_path = "logs/face_log.csv"
if not os.path.exists(csv_path):
    with open(csv_path, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "event", "faces", "image_path"])

# Timer for cooldown
last_log_time = 0
cooldown_seconds = 5  # log every 5 seconds max

print("[INFO] Starting webcam. Press 'q' to quit.")
while True:
    success, frame = cap.read()
    if not success:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_detection.process(rgb)

    face_count = 0
    if results.detections:
        face_count = len(results.detections)
        for det in results.detections:
            mp_draw.draw_detection(frame, det)

    cv2.putText(frame, f"Faces Detected: {face_count}", (30, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    # if multiple faces → log only once every 5 seconds
    if face_count > 1:
        current_time = time.time()
        if current_time - last_log_time > cooldown_seconds:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_path = f"logs/screenshots/faces_{timestamp}.jpg"
            cv2.imwrite(image_path, frame)

            with open(csv_path, mode="a", newline="") as file:
                writer = csv.writer(file)
                writer.writerow([timestamp, "multiple_faces", face_count, image_path])

            print(f"[LOG] {timestamp} | multiple_faces | faces={face_count} | {image_path}")
            last_log_time = current_time

    cv2.imshow("Face Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("[INFO] Manual exit.")
        break

cap.release()
cv2.destroyAllWindows()
