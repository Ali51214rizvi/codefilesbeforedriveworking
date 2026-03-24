from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

# Absolute path to virtual environment python
VENV_PYTHON = r"C:\Users\X\anaconda3\envs\fyp_env\python.exe"
AI_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "allinone.py")

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
