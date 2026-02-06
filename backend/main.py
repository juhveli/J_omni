from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import shutil
import os
import uuid
from pathlib import Path
from .ai_engine import engine

app = FastAPI(title="Unicorn Music AI Backend")

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
BASE_DIR = Path(__file__).resolve().parent
GENERATED_DIR = BASE_DIR / "generated"
STATIC_DIR = BASE_DIR / "static"
GENERATED_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/generated", StaticFiles(directory=str(GENERATED_DIR)), name="generated")

# Models
class GenerateRequest(BaseModel):
    prompt: str
    duration: int = 10
    style: str = "piano" # Legacy param, kept for compatibility if needed
    bpm: Optional[int] = None
    key_signature: Optional[str] = None
    time_signature: Optional[str] = None

@app.get("/health")
async def health_check():
    return {"status": "ok", "engine_ready": engine.pipeline is not None or not engine.ACESTEP_AVAILABLE}

@app.post("/generate")
async def generate_music(request: GenerateRequest):
    try:
        result = await engine.generate_layer(
            prompt=request.prompt,
            duration=request.duration,
            bpm=request.bpm,
            key_signature=request.key_signature,
            time_signature=request.time_signature
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit")
async def edit_music(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    mode: str = Form("polish")
):
    try:
        # Save uploaded file
        file_ext = os.path.splitext(file.filename)[1]
        temp_filename = f"{uuid.uuid4()}{file_ext}"
        temp_path = GENERATED_DIR / temp_filename

        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process
        result = await engine.edit_song(str(temp_path), prompt, mode)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
