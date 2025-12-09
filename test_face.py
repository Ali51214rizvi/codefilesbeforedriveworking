import face_recognition
import cv2

# Webcam start karo
video_capture = cv2.VideoCapture(0)

while True:
    ret, frame = video_capture.read()
    if not ret:
        print("❌ Webcam frame nahi mil raha!")
        break

    # BGR → RGB conversion
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Face detection
    face_locations = face_recognition.face_locations(rgb_frame)

    # Faces pe rectangle draw karo
    for (top, right, bottom, left) in face_locations:
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)

    cv2.imshow("Face Detection - Press Q to quit", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

video_capture.release()
cv2.destroyAllWindows()
