import sys

filepath = 'src/components/NoteButton.jsx'
with open(filepath, 'r') as f:
    content = f.read()

sig_search = """const NoteButton = ({ note, label, color, onStart, onStop, forceActive }) => {"""
sig_replace = """const NoteButton = ({ note, label, color, onStart, onStop, forceActive, shortcut }) => {"""
content = content.replace(sig_search, sig_replace)

jsx_search = """      <span className="note-label">{label}</span>
      {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
    </button>"""
jsx_replace = """      <span className="note-label">{label}</span>
      {shortcut && <span className="keyboard-hint">{shortcut}</span>}
      {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
    </button>"""
content = content.replace(jsx_search, jsx_replace)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated NoteButton.jsx")
