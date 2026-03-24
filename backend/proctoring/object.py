from ultralytics import YOLO
import cv2
import csv
import os
from datetime import datetime

# ----------------------------
# Load YOLO model
# ----------------------------
model = YOLO("yolov8n.pt")

# Open webcam
cap = cv2.VideoCapture(0)

# Create CSV file for evidence logging
csv_file = "object_detections.csv"
csv_exists = os.path.exists(csv_file)

with open(csv_file, mode="a", newline="") as file:
    writer = csv.writer(file)
    # Header only once
    if not csv_exists:
        writer.writerow(["Timestamp", "Object", "Confidence", "Status"])

    prohibited_items = ["cell phone", "book"]

    print("\n🚀 YOLOv8 Object Detection Started...")
    print("Press 'Q' to quit.\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Unable to read from webcam!")
            break

        # Run YOLO detection
        results = model(frame, stream=True)

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                label = model.names[cls_id]
                conf = float(box.conf[0])

                # Get box coordinates
                xyxy = box.xyxy[0].cpu().numpy().astype(int)
                x1, y1, x2, y2 = xyxy

                # Check if detected object is prohibited
                if label in prohibited_items and conf > 0.5:
                    color = (0, 0, 255)  # 🔴 Red for prohibited
                    status = "ALERT"
                    print(f"🚨 ALERT: Prohibited object detected — {label.upper()} ({conf:.2f})")

                    # Save detection info in CSV
                    writer.writerow([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), label, f"{conf:.2f}", status])

                    # Optional: save evidence image
                    evidence_folder = "evidence_images"
                    os.makedirs(evidence_folder, exist_ok=True)
                    img_name = f"{evidence_folder}/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{label}.jpg"
                    cv2.imwrite(img_name, frame)
                else:
                    color = (0, 255, 0)  # 🟢 Green for normal

                # Draw bounding box + label
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # Show the video output
        cv2.imshow("YOLOv8 Object Detection", frame)

        # Stop if 'q' key pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
print("\n🛑 Detection stopped. Data saved in 'object_detections.csv'.")
