import cv2
import mediapipe as mp
import time
import os

# Initialize MediaPipe modules
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

def detect_cheating():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Webcam not found or already in use!")
        return

    # Folder to store screenshots
    os.makedirs("screenshots", exist_ok=True)

    print("[INFO] Starting webcam... Press 'q' to quit.")

    # Timing trackers
    start_time = time.time()
    last_capture_time = 0
    look_start_time = None
    looking_direction = "Center"

    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection, \
         mp_face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1, min_detection_confidence=0.5) as face_mesh:

        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARN] Frame not captured properly.")
                break

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results_detection = face_detection.process(rgb_frame)
            results_mesh = face_mesh.process(rgb_frame)

            face_count = 0
            if results_detection.detections:
                face_count = len(results_detection.detections)
                for detection in results_detection.detections:
                    mp_drawing.draw_detection(frame, detection)

            # === MULTIPLE FACE DETECTION ===
            if face_count > 1:
                cv2.putText(frame, "⚠ ALERT: Multiple Faces Detected!", (10, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                print("[ALERT] Multiple faces detected!")

                current_time = time.time()
                if current_time - last_capture_time > 3:
                    timestamp = time.strftime("%Y%m%d-%H%M%S")
                    filename = f"screenshots/multiple_faces_{timestamp}.jpg"
                    cv2.imwrite(filename, frame)
                    print(f"[SAVED] Screenshot captured: {filename}")
                    last_capture_time = current_time

            # === HEAD DIRECTION DETECTION ===
            if results_mesh.multi_face_landmarks:
                for face_landmarks in results_mesh.multi_face_landmarks:
                    # Get key facial landmarks (eyes & nose tip)
                    nose = face_landmarks.landmark[1]
                    left_eye = face_landmarks.landmark[33]
                    right_eye = face_landmarks.landmark[263]

                    # Calculate horizontal position
                    center_x = (left_eye.x + right_eye.x) / 2
                    nose_x = nose.x

                    diff = nose_x - center_x
                    prev_direction = looking_direction

                    if diff > 0.03:
                        looking_direction = "Right"
                    elif diff < -0.03:
                        looking_direction = "Left"
                    else:
                        looking_direction = "Center"

                    cv2.putText(frame, f"Direction: {looking_direction}", (10, 110),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)

                    # Track time of looking away
                    if looking_direction in ["Left", "Right"]:
                        if look_start_time is None:
                            look_start_time = time.time()
                        elif time.time() - look_start_time > 5:
                            cv2.putText(frame, "⚠ ALERT: Looking Away > 5s!", (10, 150),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                            print(f"[ALERT] Person looking {looking_direction} for more than 5 seconds!")

                            current_time = time.time()
                            if current_time - last_capture_time > 3:
                                timestamp = time.strftime("%Y%m%d-%H%M%S")
                                filename = f"screenshots/looking_{looking_direction}_{timestamp}.jpg"
                                cv2.imwrite(filename, frame)
                                print(f"[SAVED] Screenshot captured: {filename}")
                                last_capture_time = current_time
                                look_start_time = None  # reset after capture
                    else:
                        look_start_time = None

            cv2.putText(frame, f"Faces: {face_count}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            cv2.imshow("Cheating Detection System", frame)

            # Exit conditions
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("[INFO] Exiting...")
                break
            if time.time() - start_time > 120:
                print("[INFO] Auto timeout reached (120 sec).")
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    detect_cheating()
