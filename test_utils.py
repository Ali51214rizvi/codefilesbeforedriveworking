# test_utils.py
import numpy as np
from utils import save_encoding, load_database, log_event

# Dummy encoding
enc = np.random.rand(128)
student_id = "Moona_test"

# Save encoding
save_encoding(student_id, enc)

# Load DB
db = load_database()
print("DB keys:", list(db.keys()))

# Log event
log_event(student_id, "TEST_EXAM", "auth_success", details="test run")

print("Check face_db/, logs/events.csv")
