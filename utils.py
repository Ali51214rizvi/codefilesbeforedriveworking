import os
import pickle
import numpy as np
import csv
from datetime import datetime
from PIL import Image
import base64
import io

# Directories
BASE_DIR = os.path.dirname(__file__)
DB_DIR = os.path.join(BASE_DIR, "face_db")
SCREEN_DIR = os.path.join(BASE_DIR, "screenshots")
LOG_DIR = os.path.join(BASE_DIR, "logs")

# Create if not exist
os.makedirs(DB_DIR, exist_ok=True)
os.makedirs(SCREEN_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

LOG_CSV = os.path.join(LOG_DIR, "events.csv")

# --- Save encoding for a student ---
def save_encoding(student_id, encoding):
    path = os.path.join(DB_DIR, f"{student_id}.pkl")
    with open(path, "wb") as f:
        pickle.dump({
            "student_id": student_id,
            "encoding": np.array(encoding)
        }, f)
    return path

# --- Load all encodings into memory ---
def load_database():
    db = {}
    for fname in os.listdir(DB_DIR):
        if fname.endswith(".pkl"):
            with open(os.path.join(DB_DIR, fname), "rb") as f:
                data = pickle.load(f)
                db[data["student_id"]] = np.array(data["encoding"])
    return db

# --- Log authentication/suspicious events ---
def log_event(student_id, exam_id, event_type, details=None, save_screenshot_b64=None):
    now = datetime.utcnow().isoformat()
    row = [now, student_id or "", exam_id or "", event_type, str(details or "")]
    
    # Save screenshot if provided
    if save_screenshot_b64:
        fn = f"{now.replace(':','-')}_{student_id or 'unknown'}.png"
        path = os.path.join(SCREEN_DIR, fn)
        image_data = base64.b64decode(save_screenshot_b64.split(",")[-1])
        img = Image.open(io.BytesIO(image_data))
        img.save(path)
        row.append(path)
    else:
        row.append("")
    
    # Append to CSV
    if not os.path.exists(LOG_CSV):
        with open(LOG_CSV, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["timestamp","student_id","exam_id","event_type","details","screenshot_path"])
    with open(LOG_CSV, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(row)
    return True
