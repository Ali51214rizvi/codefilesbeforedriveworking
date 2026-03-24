import cv2
import mediapipe as mp
import time
import os
import csv
from datetime import datetime
import numpy as np

# ---------- SETTINGS ----------
CAM_INDEX = 0
FRAME_WIDTH = 640
MIN_DET_CONF = 0.5
MIN_TRACK_CONF = 0.5

LOOK_AWAY_SECONDS = 5            # required continuous seconds looking left/right
CONSECUTIVE_FRAMES_TO_CONFIRM = 3
HORIZONTAL_THRESHOLD = 0.20      # sensitivity for left/right (adjust smaller = more sensitive)
COOLDOWN_SECONDS = 10            # wait after logging before next allowed log

SAVE_DIR = "logs/lookaway_screenshots"
CSV_PATH = "logs/lookaway_log.csv"

# landmark indices (MediaPipe FaceMesh)
LEFT_IRIS_IDX = 468
RIGHT_IRIS_IDX = 473
NOSE_IDX = 1
LEFT_EYE_CORNER = 33
RIGHT_EYE_CORNER = 362

# ---------- PREPARE FOLDERS & CSV ----------
os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(os.path.dirname(CSV_PATH) or ".", exist_ok=True)
if not os.path.exists(CSV_PATH):
    with open(CSV_PATH, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "event", "direction", "duration_seconds", "faces", "image_path"])

# ---------- HELPERS ----------
def normalized_point(landmark, image_w, image_h):
    return np.array([landmark.x * image_w, landmark.y * image_h])

def save_screenshot(frame, reason, duration, face_count):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = f"{reason}_{ts}.jpg"
    path = os.path.join(SAVE_DIR, fname)
    ok = cv2.imwrite(path, frame)
    if ok:
        with open(CSV_PATH, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([datetime.utcnow().isoformat(), "LOOK_AWAY", reason, f"{duration:.2f}", face_count, path])
        print(f"[LOG] {ts} | LOOK_AWAY | {reason} | duration={duration:.2f}s | faces={face_count} | {path}")
    else:
        print(f"[ERROR] Failed to write screenshot to {path}")

# ---------- MAIN ----------
def detect_left_right_only():
    mp_face_mesh = mp.solutions.face_mesh
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera {CAM_INDEX}")
        return

    last_log_time = 0.0
    lookaway_start = None
    consecutive_away_frames = 0

    with mp_face_mesh.FaceMesh(static_image_mode=False,
                               max_num_faces=1,
                               refine_landmarks=True,
                               min_detection_confidence=MIN_DET_CONF,
                               min_tracking_confidence=MIN_TRACK_CONF) as mesh:

        print("[INFO] Starting gaze monitor (left/right only). Press 'q' to quit.")
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARN] Frame not captured.")
                break

            # optional resize for speed
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
            dbg_dx = None

            if results.multi_face_landmarks:
                face_count = len(results.multi_face_landmarks)
                lm = results.multi_face_landmarks[0].landmark

                # Try to get iris + nose coordinates (preferred)
                try:
                    left_iris = normalized_point(lm[LEFT_IRIS_IDX], w, h)
                    right_iris = normalized_point(lm[RIGHT_IRIS_IDX], w, h)
                    nose = normalized_point(lm[NOSE_IDX], w, h)
                    iris_center = (left_iris + right_iris) / 2.0
                except Exception:
                    # fallback: use eye corners + nose if iris landmarks unavailable
                    try:
                        left_eye = normalized_point(lm[LEFT_EYE_CORNER], w, h)
                        right_eye = normalized_point(lm[RIGHT_EYE_CORNER], w, h)
                        nose = normalized_point(lm[NOSE_IDX], w, h)
                        iris_center = (left_eye + right_eye) / 2.0
                    except Exception:
                        iris_center = None
                        nose = None

                if iris_center is not None and nose is not None:
                    # estimate face_width using eye corners if possible
                    try:
                        left_eye_corner = normalized_point(lm[LEFT_EYE_CORNER], w, h)
                        right_eye_corner = normalized_point(lm[RIGHT_EYE_CORNER], w, h)
                        face_width = np.linalg.norm(right_eye_corner - left_eye_corner)
                    except Exception:
                        face_width = np.linalg.norm(right_iris - left_iris) if 'left_iris' in locals() and 'right_iris' in locals() else (w * 0.25)

                    dx = (iris_center[0] - nose[0]) / (face_width + 1e-6)
                    dbg_dx = dx

                    # only care about left/right: check horizontal threshold
                    if abs(dx) > HORIZONTAL_THRESHOLD:
                        frame_away = True
                        away_direction = "left" if dx < 0 else "right"
                    else:
                        frame_away = False
                        away_direction = None

                    # draw debug points
                    cx, cy = int(iris_center[0]), int(iris_center[1])
                    nx, ny = int(nose[0]), int(nose[1])
                    cv2.circle(frame, (cx, cy), 2, (0,255,0), -1)
                    cv2.circle(frame, (nx, ny), 2, (255,0,0), -1)
                    cv2.putText(frame, f"dx={dx:.2f}", (10,60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,0), 1)

                # draw mesh for visibility
                mp_drawing.draw_landmarks(frame, results.multi_face_landmarks[0],
                                          mp_face_mesh.FACEMESH_TESSELATION,
                                          landmark_drawing_spec=None,
                                          connection_drawing_spec=mp_drawing.DrawingSpec(thickness=1, color=(0,255,0)))

            else:
                # no face detected -> reset
                frame_away = False
                away_direction = None
                consecutive_away_frames = 0
                lookaway_start = None

            # smoothing: require N consecutive frames
            if frame_away and away_direction in ("left", "right"):
                consecutive_away_frames += 1
            else:
                consecutive_away_frames = 0
                lookaway_start = None

            if consecutive_away_frames >= CONSECUTIVE_FRAMES_TO_CONFIRM:
                if lookaway_start is None:
                    lookaway_start = time.time()
                elapsed = time.time() - lookaway_start
                cv2.putText(frame, f"AWAY {away_direction} {elapsed:.1f}s", (10,90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)

                if elapsed >= LOOK_AWAY_SECONDS and (time.time() - last_log_time) >= COOLDOWN_SECONDS:
                    save_screenshot(frame, away_direction, elapsed, face_count)
                    last_log_time = time.time()
                    # reset to avoid repeated immediate logs
                    lookaway_start = None
                    consecutive_away_frames = 0

            # overlays
            cv2.putText(frame, f"Faces: {face_count}", (10,30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
            if dbg_dx is not None:
                cv2.putText(frame, f"dx={dbg_dx:.2f}", (10,110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200,200,0), 1)

            cv2.imshow("Gaze LR Monitor (press q to quit)", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    detect_left_right_only()
