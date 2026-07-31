import speech_recognition as sr
from gtts import gTTS
import os
import uuid
from app.core.config import settings

class VoiceService:
    @staticmethod
    async def speech_to_text(audio_path: str) -> str:
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError:
            return "Speech recognition service unavailable"

    @staticmethod
    async def text_to_speech(text: str, language: str = "en") -> str:
        tts = gTTS(text=text, lang=language, slow=False)
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(settings.UPLOAD_DIR, "audio", filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        tts.save(filepath)
        return filepath
