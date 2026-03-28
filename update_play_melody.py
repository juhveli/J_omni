import sys

filepath = 'src/utils/AudioEngine.js'
with open(filepath, 'r') as f:
    content = f.read()

play_melody_search = """    playMelody(melody) {
        if (!this.initialized) return;

        const now = Tone.now();
        let cumulativeTime = 0;

        melody.forEach(item => {
            const duration = item.duration || "8n";
            const note = item.note;

            // Schedule note
            this.playNote(note, duration, now + cumulativeTime);

            cumulativeTime += Tone.Time(duration).toSeconds();
        });
    }"""
play_melody_replace = """    playMelody(melody) {
        if (!this.initialized) return;

        // Clear previous melody events to prevent overlap
        Tone.Transport.cancel();
        Tone.Transport.stop();

        let cumulativeTime = 0;

        melody.forEach(item => {
            const duration = item.duration || "8n";
            const note = item.note;

            // Schedule note relative to transport start
            Tone.Transport.schedule((time) => {
                this.playNote(note, duration, time);
            }, cumulativeTime);

            cumulativeTime += Tone.Time(duration).toSeconds();
        });

        // Start transport to play the melody
        Tone.Transport.start();
    }"""
content = content.replace(play_melody_search, play_melody_replace)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated playMelody in AudioEngine.js")
