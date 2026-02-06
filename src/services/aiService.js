const API_BASE = '/api';

export const AIService = {
    async checkHealth() {
        try {
            const res = await fetch(`${API_BASE}/health`);
            if (!res.ok) return { status: "error", engine_ready: false };
            return await res.json();
        } catch (e) {
            console.error("AI Service Health Check Failed", e);
            return { status: "error", engine_ready: false };
        }
    },

    async generateLayer(prompt, duration = 10, style = "piano") {
        try {
            const res = await fetch(`${API_BASE}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, duration, style })
            });
            if (!res.ok) throw new Error("Generation failed");
            return await res.json();
        } catch (e) {
             console.warn("AI Generation unavailable, using fallback mock.");
             return { success: false, message: "Magic Server not found! (This feature needs a backend)" };
        }
    },

    async editSong(audioBlob, prompt, mode = "polish") {
        try {
            const formData = new FormData();
            // WebM is the default container for Tone.Recorder/MediaRecorder
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('prompt', prompt);
            formData.append('mode', mode);

            const res = await fetch(`${API_BASE}/edit`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error("Editing failed");
            return await res.json();
        } catch (e) {
             console.warn("AI Edit unavailable, using fallback mock.");
             return { success: false, message: "Magic Server not found! (This feature needs a backend)" };
        }
    }
};
