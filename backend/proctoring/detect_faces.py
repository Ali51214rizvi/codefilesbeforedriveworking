import cv2
import mediapipe as mp
import time
import os

# Initialize MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

def detect_multiple_faces():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Webcam not found or already in use!")
        return

    # Create folder to save screenshots
    os.makedirs("screenshots", exist_ok=True)

    print("[INFO] Starting webcam... Press 'q' to quit.")
    start_time = time.time()
    last_capture_time = 0  # To prevent repeated captures within short intervals

    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARN] Frame not captured properly.")
                break

            # Convert frame to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Detect faces
            results = face_detection.process(rgb_frame)
            face_count = 0

            if results.detections:
                face_count = len(results.detections)
                for detection in results.detections:
                    mp_drawing.draw_detection(frame, detection)

            # Show face count
            cv2.putText(frame, f"Faces Detected: {face_count}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            # If more than one face detected → alert + take screenshot
            if face_count > 1:
                cv2.putText(frame, "⚠ ALERT: Multiple Faces Detected!", (10, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                print("[ALERT] Multiple faces detected!")

                current_time = time.time()
                # Capture screenshot only if 3 seconds have passed since last capture
                if current_time - last_capture_time > 3:
                    timestamp = time.strftime("%Y%m%d-%H%M%S")
                    filename = f"screenshots/multiple_faces_{timestamp}.jpg"
                    cv2.imwrite(filename, frame)
                    print(f"[SAVED] Screenshot captured: {filename}")
                    last_capture_time = current_time

            cv2.imshow("Cheating Detection - MediaPipe", frame)

            # Exit conditions
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            if time.time() - start_time > 120:  # auto stop after 2 minutes
                print("[INFO] Auto timeout reached (120 sec).")
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    detect_multiple_faces()
