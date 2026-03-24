from ultralytics import YOLO
import cv2
import csv
import os
import time
from datetime import datetime
import mediapipe as mp
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
#from google.auth.transport.requests import Request
# from google.oauth2.credentials import Credentials
# from google_auth_oauthlib.flow import InstalledAppFlow
# import pickle


# ----------------------------
# Load Models
# ----------------------------
yolo_model = YOLO("yolov8n.pt")
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils


# ----------------------------
# Create Evidence Folders
# ----------------------------
os.makedirs("evidence_images", exist_ok=True)
os.makedirs("screenshots", exist_ok=True)

# ----------------------------
# CSV Logging
# ----------------------------
csv_file = "object_detections.csv"
csv_exists = os.path.exists(csv_file)
f = open(csv_file, mode="a", newline="")
writer = csv.writer(f)
if not csv_exists:
    writer.writerow(["Timestamp", "Object", "Confidence", "Status", "Image_Path", "Drive_Link"])

# ----------------------------
# Start Webcam
# ----------------------------
# ----------------------------



# Google Drive Configuration
# ----------------------------
# SERVICE_ACCOUNT_FILE = "proctorai-fyp-f857726b97f5.json"
# SCOPES = ["https://www.googleapis.com/auth/drive"]

# credentials = service_account.Credentials.from_service_account_file(
#     SERVICE_ACCOUNT_FILE, scopes=SCOPES
# )
# from google_auth_oauthlib.flow import InstalledAppFlow
# from google.auth.transport.requests import Request
# import pickle








#this was the google oath working



# SCOPES = ["https://www.googleapis.com/auth/drive.file"]

# creds = None

# if os.path.exists("token.pickle"):
#     with open("token.pickle", "rb") as token:
#         creds = pickle.load(token)

# if not creds or not creds.valid:
#     if creds and creds.expired and creds.refresh_token:
#         try:
#             creds.refresh(Request())
#         except Exception as e:
#             print("⚠ Refresh failed. Re-authenticating...")
#             creds = None

#     if not creds:
#         flow = InstalledAppFlow.from_client_secrets_file(
#             "credentials.json", SCOPES
#         )
#         creds = flow.run_local_server(port=0)   # ✅ better than run_console()

#     with open("token.pickle", "wb") as token:
#         pickle.dump(creds, token)

# drive_service = build("drive", "v3", credentials=creds)
#drive_service = build("drive", "v3", credentials=credentials)
# drive_service = build("drive", "v3", credentials=credentials, cache_discovery=False)






#below is service account demo

SERVICE_ACCOUNT_FILE = "proctorai-fyp-f857726b97f5.json"

SCOPES = ["https://www.googleapis.com/auth/drive"]

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=SCOPES
)

drive_service = build("drive", "v3", credentials=credentials)







# 🔴 PUT YOUR GOOGLE DRIVE FOLDER ID HERE
DRIVE_FOLDER_ID = "1_cceLFV7fP8U8dbi4kHUlVnVPPsCcKZD"

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("[ERROR] Webcam not found or already in use!")
    exit()

print("\n🚀 REALTIME EXAM MONITORING SYSTEM RUNNING…\nPress 'Q' to exit.\n")






def upload_to_drive(file_path, drive_folder_id):
    try:
        file_name = os.path.basename(file_path)
        print(f"📤 Uploading {file_name} to folder {drive_folder_id}")

        file_metadata = {
            "name": file_name,
            "parents": [drive_folder_id]
        }

        media = MediaFileUpload(file_path, resumable=True)

        uploaded_file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id",
            # supportsAllDrives=True

        ).execute()
        print("Uploading to folder:", drive_folder_id)

        print(f"☁ Uploaded to Drive: {file_name} (ID: {uploaded_file.get('id')})")

        # OPTIONAL: delete local file after upload
        # os.remove(file_path)

    except Exception as e:
        print(f"❌ Drive upload failed for {file_path}: {e}")












# Cheating timers
last_capture_time = 0
look_start_time = None
looking_direction = "Center"

prohibited_items = ["cell phone", "book", "laptop", "tablet", "headphones", "earphones", "smartwatch", "wallet", "keys", "pen", "paper", "notes", "calculator" ,"remote"]

with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection, \
     mp_face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1, min_detection_confidence=0.5) as face_mesh:

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[WARN] Frame not captured properly.")
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # ----------------------------
        # YOLO OBJECT DETECTION
        # ----------------------------
        results = yolo_model(frame, stream=True)
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                label = yolo_model.names[cls_id]
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].cpu().numpy().astype(int)
                x1, y1, x2, y2 = xyxy

                if label in prohibited_items and conf > 0.5:
                    color = (0, 0, 255)
                    status = "ALERT"
                    print(f"🚨 ALERT: Prohibited object detected — {label.upper()} ({conf:.2f})")

                    writer.writerow([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), label, f"{conf:.2f}", status])

                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

                    # Save cropped object

                    cropped = frame[y1:y2, x1:x2]
                    crop_path = f"evidence_images/{timestamp}_{label}_CROP.jpg"
                    full_path = f"evidence_images/{timestamp}_{label}_FULL.jpg"
                    cv2.imwrite(crop_path, cropped)
                    cv2.imwrite(full_path, frame)
                    upload_to_drive(crop_path, DRIVE_FOLDER_ID)
                    upload_to_drive(full_path, DRIVE_FOLDER_ID)



#                    cv2.imwrite(f"evidence_images/{timestamp}_{label}_CROP.jpg", cropped)

                    # Save full frame
 #                   cv2.imwrite(f"evidence_images/{timestamp}_{label}_FULL.jpg", frame)
                else:
                    color = (0, 255, 0)

                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # ----------------------------
        # FACE DETECTION
        # ----------------------------
        results_detection = face_detection.process(rgb_frame)
        results_mesh = face_mesh.process(rgb_frame)

        face_count = 0
        if results_detection.detections:
            face_count = len(results_detection.detections)
            for detection in results_detection.detections:
                mp_drawing.draw_detection(frame, detection)

        if face_count > 1:
            cv2.putText(frame, "⚠ ALERT: Multiple Faces!", (10, 70),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            print("[ALERT] Multiple faces detected!")

            current_time = time.time()
            if current_time - last_capture_time > 3:
                filename = f"screenshots/multiple_faces_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                cv2.imwrite(filename, frame)
                upload_to_drive(filename, DRIVE_FOLDER_ID)
                print(f"[SAVED + UPLOADED] Screenshot captured: {filename}")
#                print(f"[SAVED] Screenshot captured: {filename}")
                last_capture_time = current_time

        # ----------------------------
        # HEAD DIRECTION MONITORING
        # ----------------------------
        if results_mesh.multi_face_landmarks:
            for face_landmarks in results_mesh.multi_face_landmarks:
                nose = face_landmarks.landmark[1]
                left_eye = face_landmarks.landmark[33]
                right_eye = face_landmarks.landmark[263]

                center_x = (left_eye.x + right_eye.x) / 2
                diff = nose.x - center_x
                prev_direction = looking_direction

                if diff > 0.03:
                    looking_direction = "Right"
                elif diff < -0.03:
                    looking_direction = "Left"
                else:
                    looking_direction = "Center"

                cv2.putText(frame, f"Looking: {looking_direction}", (10, 110),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)

                if looking_direction in ["Left", "Right"]:
                    if look_start_time is None:
                        look_start_time = time.time()
                    elif time.time() - look_start_time > 5:
                        cv2.putText(frame, "⚠ ALERT: Looking Away > 5s!", (10, 150),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                        print(f"[ALERT] Student looking {looking_direction} for over 5 seconds!")

                        filename = f"screenshots/looking_{looking_direction}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                        cv2.imwrite(filename, frame)
                        upload_to_drive(filename, DRIVE_FOLDER_ID)
                        print(f"[SAVED + UPLOADED] Screenshot captured: {filename}")
#                        print(f"[SAVED] Screenshot captured: {filename}")

                        look_start_time = None
                else:
                    look_start_time = None

        cv2.putText(frame, f"Faces: {face_count}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        cv2.imshow("EXAM CHEATING DETECTION", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("[INFO] Exiting...")
            break

cap.release()
f.flush()
upload_to_drive(csv_file, DRIVE_FOLDER_ID)

f.close()
cv2.destroyAllWindows()
print("\n🛑 Detection stopped. Data saved.\n")
