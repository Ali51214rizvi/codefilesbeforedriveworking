from flask import Flask, jsonify
import subprocess
import os

app = Flask(__name__)

PROCESS = None   # To store process info

@app.route("/start_detection", methods=["POST"])
def start_detection():
    global PROCESS

    if PROCESS is not None and PROCESS.poll() is None:
        return jsonify({"status": "already_running"}), 400

    PROCESS = subprocess.Popen(["python", "allinone.py"])
    return jsonify({"status": "started"})

@app.route("/stop_detection", methods=["POST"])
def stop_detection():
    global PROCESS

    if PROCESS is not None:
        PROCESS.terminate()
        PROCESS = None
        return jsonify({"status": "stopped"})

    return jsonify({"status": "not_running"}), 400

@app.route("/status", methods=["GET"])
def status():
    if PROCESS is None:
        return jsonify({"running": False})
    return jsonify({"running": PROCESS.poll() is None})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
