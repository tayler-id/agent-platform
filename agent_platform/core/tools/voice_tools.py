from gtts import gTTS
import os
from typing import Optional
from .base import BaseTool, ToolConfig

class TextToSpeechTool(BaseTool):
    def __init__(self):
        config = ToolConfig(name="text_to_speech", version="1.0.0")
        super().__init__(config)

    def execute(self, text: str, lang: Optional[str] = 'en') -> str:
        """Converts text to speech and saves it as an audio file.

        Args:
            text: The text to convert to speech.
            lang: The language for the speech (default is English). Can be None to use default language.

        Returns:
            The path to the generated audio file.
        """
        tts = gTTS(text=text, lang=lang, slow=False)
        filename = "output.mp3"
        tts.save(filename)
        return filename

class SpeechToTextTool(BaseTool):
    def __init__(self):
        config = ToolConfig(name="speech_to_text", version="1.0.0")
        super().__init__(config)

    def execute(self, audio_path: str) -> str:
        """Converts speech from an audio file to text.

        Args:
            audio_path: The path to the audio file.

        Returns:
            The transcribed text.
        """
        import speech_recognition as sr
        r = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = r.record(source)
            try:
                text = r.recognize_google(audio_data)
                return text
            except sr.UnknownValueError:
                return "Could not understand audio"
            except sr.RequestError as e:
                return f"Could not request results from Google Speech Recognition service; {e}"
