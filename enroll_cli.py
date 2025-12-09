# enroll_cli.py
import cv2
import face_recognition
from utils import save_encoding
import time

def enroll_student(student_id, num_images=5, max_time=60):
    if not student_id.strip():
        print("[ERROR] Student ID cannot be empty!")
        return

    cap = cv2.VideoCapture(0)
    print(f"[INFO] Starting webcam for enrollment: {student_id}")
    
    count = 0
    encodings = []
    start_time = time.time()
    
    while count < num_images:
        # Check timeout
        if time.time() - start_time > max_time:
            print("[WARN] Timeout reached! Exiting enrollment.")
            break
        
        ret, frame = cap.read()
        if not ret:
            continue
        
        rgb_frame = frame[:, :, ::-1]
        face_locations = face_recognition.face_locations(rgb_frame)

        if len(face_locations) != 1:
            cv2.putText(frame, "Ensure only one face is visible", (10,30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2)
            cv2.imshow("Enroll", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            continue
        
        # ---------------- Safe Encoding Snippet ----------------
        try:
            encs = face_recognition.face_encodings(rgb_frame)
            if len(encs) == 0:
                continue
            face_enc = encs[0]
        except Exception as e:
            print(f"[WARN] Face encoding error: {e}")
            continue
        # -------------------------------------------------------

        encodings.append(face_enc)
        count += 1
        cv2.putText(frame, f"Captured {count}/{num_images}", (10,30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
        cv2.imshow("Enroll", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    if encodings:
        avg_encoding = sum(encodings)/len(encodings)
        save_encoding(student_id, avg_encoding)
        print(f"[INFO] Enrollment complete for {student_id}")
    else:
        print("[ERROR] No valid faces captured!")

if __name__ == "__main__":
    student_id = input("Enter Student ID for enrollment: ")
    enroll_student(student_id)
