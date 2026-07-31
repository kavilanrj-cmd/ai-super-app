from PIL import Image
import pytesseract
from typing import Optional

class OCRService:
    @staticmethod
    async def extract_text(image_path: str, language: str = "eng") -> str:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, lang=language)
        return text.strip()

    @staticmethod
    async def extract_structured(image_path: str) -> dict:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        return {
            "text": text.strip(),
            "words": data.get("text", []),
            "confidences": data.get("conf", [])
        }
