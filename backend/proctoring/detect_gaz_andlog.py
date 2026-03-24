# detect_gaze_and_log.py
import cv2
import mediapipe as mp
import time
import os
import csv
from datetime import datetime
import numpy as np

# ---------- SETTINGS ----------
CAM_INDEX = 0               # camera device index
FRAME_WIDTH = 640           # resize width for speed
MODEL_COMPLEXITY = 0        # face mesh complexity (0 or 1)
MIN_DET_CONF = 0.5
MIN_TRACK_CONF = 0.5

LOOK_AWAY_SECONDS = 5       # time threshold to consider "looking away"
COOLDOWN_SECONDS = 10       # after a log, wait this long before logging again
CONSECUTIVE_FRAMES_TO_CONFIRM = 3  # require N consecutive frames before counting as away frame
SAVE_DIR = "logs/screenshots"
CSV_PATH = "logs/face_log.csv"

# Landmark indices used (MediaPipe Face Mesh)
# iris centers: left=468, right=473
# nose tip: 1
LEFT_IRIS_IDX = 468
RIGHT_IRIS_IDX = 473
NOSE_IDX = 1

# Thresholds (normalized units relative to face width)
HORIZONTAL_THRESHOLD = 0.22   # > this -> looking left/right
VERTICAL_THRESHOLD = 0.20     # > this -> looking up/down

# ---------- PREPARE FOLDERS & CSV ----------
os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(os.path.dirname(CSV_PATH) or ".", exist_ok=True)
if not os.path.exists(CSV_PATH):
    with open(CSV_PATH, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "event", "direction", "duration_seconds", "faces", "image_path"])

# ---------- HELPERS ----------
def normalized_point(landmark, image_w, image_h):
    """Return (x,y) in pixel coords from normalized landmark."""
    return np.array([landmark.x * image_w, landmark.y * image_h])

def save_screenshot(frame, reason, duration, face_count):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = f"{reason}_{ts}.jpg"
    path = os.path.join(SAVE_DIR, fname)
    cv2.imwrite(path, frame)
    # append CSV
    with open(CSV_PATH, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([datetime.utcnow().isoformat(), "LOOK_AWAY", reason, f"{duration:.2f}", face_count, path])
    print(f"[LOG] {ts} | LOOK_AWAY | {reason} | duration={duration:.2f}s | faces={face_count} | {path}")

# ---------- MAIN ----------
def detect_gaze_and_log():
    mp_face_mesh = mp.solutions.face_mesh
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera {CAM_INDEX}")
        return

    last_log_time = 0
    lookaway_start = None
    consecutive_away_frames = 0
    frame_rate = cap.get(cv2.CAP_PROP_FPS) or 30.0
    check_interval = 1.0 / max(1.0, frame_rate)  # not used for sleep, just conceptual

    with mp_face_mesh.FaceMesh(static_image_mode=False,
                              max_num_faces=2,
                              refine_landmarks=True,
                              min_detection_confidence=MIN_DET_CONF,
                              min_tracking_confidence=MIN_TRACK_CONF) as mesh:

        print("[INFO] Starting gaze monitor. Press 'q' to quit.")
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARN] Frame not captured.")
                break

            h, w = frame.shape[:2]
            if w > FRAME_WIDTH:
                scale = FRAME_WIDTH / w
                frame = cv2.resize(frame, (int(w*scale), int(h*scale)))
                h, w = frame.shape[:2]

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = mesh.process(rgb)

            face_count = 0
            frame_away = False
            away_direction = None

            if results.multi_face_landmarks:
                face_count = len(results.multi_face_landmarks)
                # Use the first face (primary)
                lm = results.multi_face_landmarks[0].landmark

                # get pixel coords
                try:
                    left_iris = normalized_point(lm[LEFT_IRIS_IDX], w, h)
                    right_iris = normalized_point(lm[RIGHT_IRIS_IDX], w, h)
                    nose = normalized_point(lm[NOSE_IDX], w, h)
                except IndexError:
                    # landmark indices not present for some reason
                    left_iris = right_iris = nose = None

                if left_iris is not None and right_iris is not None and nose is not None:
                    # average iris center
                    iris_center = (left_iris + right_iris) / 2.0

                    # face width approx: distance between left-most and right-most landmarks
                    # Use outer eye corners (approx): 33 and 362 often map to outer eye corners.
                    # Fallback: use distance between irises
                    try:
                        left_eye_corner = normalized_point(lm[33], w, h)
                        right_eye_corner = normalized_point(lm[362], w, h)
                        face_width = np.linalg.norm(right_eye_corner - left_eye_corner)
                    except Exception:
                        face_width = np.linalg.norm(right_iris - left_iris)

                    # normalized offsets (pixels divided by face_width)
                    dx = (iris_center[0] - nose[0]) / (face_width + 1e-6)
                    dy = (iris_center[1] - nose[1]) / (face_width + 1e-6)

                    # determine direction
                    if abs(dx) > HORIZONTAL_THRESHOLD:
                        frame_away = True
                        away_direction = "left" if dx < 0 else "right"
                    elif abs(dy) > VERTICAL_THRESHOLD:
                        frame_away = True
                        away_direction = "up" if dy < 0 else "down"

                    # draw debug on frame
                    cx, cy = int(iris_center[0]), int(iris_center[1])
                    nx, ny = int(nose[0]), int(nose[1])
                    cv2.circle(frame, (cx, cy), 2, (0,255,0), -1)
                    cv2.circle(frame, (nx, ny), 2, (255,0,0), -1)
                    cv2.putText(frame, f"dx={dx:.2f} dy={dy:.2f}", (10,60),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,0), 1)

                # draw landmarks/bbox for visual feedback
                mp_drawing.draw_landmarks(frame, results.multi_face_landmarks[0],
                                          mp_face_mesh.FACEMESH_TESSELATION,
                                          landmark_drawing_spec=None,
                                          connection_drawing_spec=mp_drawing.DrawingSpec(thickness=1, color=(0,255,0)))
            else:
                # no face detected -> consider as looking away? we will treat as not-away (you can change)
                frame_away = False
                away_direction = None

            # smoothing: require a few consecutive frames to consider away-frame
            if frame_away:
                consecutive_away_frames += 1
            else:
                consecutive_away_frames = 0
                lookaway_start = None

            # if we have enough consecutive away frames, start/continue timing
            if consecutive_away_frames >= CONSECUTIVE_FRAMES_TO_CONFIRM:
                if lookaway_start is None:
                    lookaway_start = time.time()
                elapsed = time.time() - lookaway_start
                cv2.putText(frame, f"AWAY {away_direction} {elapsed:.1f}s", (10,90),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)

                # if exceeds threshold and cooldown elapsed -> save
                if elapsed >= LOOK_AWAY_SECONDS and (time.time() - last_log_time) >= COOLDOWN_SECONDS:
                    save_screenshot(frame, away_direction, elapsed, face_count)
                    last_log_time = time.time()
                    # reset tracker to avoid multiple logs in quick succession
                    lookaway_start = None
                    consecutive_away_frames = 0
            else:
                # show neutral
                pass

            # overlay face count and instructions
            cv2.putText(frame, f"Faces: {face_count}", (10,30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
            cv2.imshow("Gaze Monitor - press q to quit", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("[INFO] Manual exit.")
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    detect_gaze_and_log()
