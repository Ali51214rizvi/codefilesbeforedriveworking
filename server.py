from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

# Absolute path to virtual environment python
VENV_PYTHON = r"D:\fyp\face_module\face_auth_project\venv310\Scripts\python.exe"
AI_SCRIPT = r"D:\fyp\face_module\face_auth_project\allinone.py"

@app.route("/start-camera", methods=["GET"])

def start_camera():
    try:
        subprocess.Popen(
            [VENV_PYTHON, AI_SCRIPT],
            cwd=os.path.dirname(AI_SCRIPT),  # <-- ensures script runs in its folder
            shell=True                      # <-- helps Windows run it correctly
        )
        return jsonify({"message": "Camera started and model running!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# def start_camera():
#     try:
#         subprocess.Popen([VENV_PYTHON, AI_SCRIPT])
#         return jsonify({"message": "Camera started and model running!"})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
