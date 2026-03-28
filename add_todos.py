import sys

# LayerManager
filepath = 'src/components/LayerManager.jsx'
with open(filepath, 'r') as f:
    content = f.read()

lm_search = "const LayerManager = ({ isAudioStarted }) => {"
lm_replace = "// TODO: Extract layer items for React.memo optimization\nconst LayerManager = ({ isAudioStarted }) => {"
content = content.replace(lm_search, lm_replace)

with open(filepath, 'w') as f:
    f.write(content)

# AudioEngine
filepath = 'src/utils/AudioEngine.js'
with open(filepath, 'r') as f:
    content = f.read()

ae_search = "class AudioEngine {"
ae_replace = "// TODO: Add Web MIDI Velocity Sensitivity\nclass AudioEngine {"
content = content.replace(ae_search, ae_replace)

with open(filepath, 'w') as f:
    f.write(content)

# InstrumentPad
filepath = 'src/components/InstrumentPad.jsx'
with open(filepath, 'r') as f:
    content = f.read()

ip_search = "const InstrumentPad = ({ currentScale, currentInstrument }) => {"
ip_replace = "// TODO: Enable WebRTC Collaboration\nconst InstrumentPad = ({ currentScale, currentInstrument }) => {"
content = content.replace(ip_search, ip_replace)

with open(filepath, 'w') as f:
    f.write(content)

print("Added 3 new TODOs")
