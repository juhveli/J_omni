import os

rc_path = "src/components/RecordingControls.jsx"

with open(rc_path, "r") as f:
    rc_content = f.read()
rc_content = rc_content.replace("RecordingEngine.onRecordingStateChange = (recording, _source) => {", "RecordingEngine.onRecordingStateChange = (recording) => {")
with open(rc_path, "w") as f:
    f.write(rc_content)
