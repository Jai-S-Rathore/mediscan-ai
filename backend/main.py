from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import boto3
import base64
import json
import os
import io
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── AWS Clients ──────────────────────────────────────────
def get_bedrock():
    return boto3.client(
        service_name="bedrock-runtime",
        region_name="us-east-1",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

def get_polly():
    return boto3.client(
        service_name="polly",
        region_name="us-east-1",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

# ── Language Config ──────────────────────────────────────
LANGUAGE_CONFIG = {
    "English (US)":        {"polly_voice": "Joanna",  "polly_code": "en-US"},
    "English (UK)":        {"polly_voice": "Amy",     "polly_code": "en-GB"},
    "English (Australia)": {"polly_voice": "Nicole",  "polly_code": "en-AU"},
    "Hindi":               {"polly_voice": "Aditi",   "polly_code": "hi-IN"},
    "Spanish (Spain)":     {"polly_voice": "Lucia",   "polly_code": "es-ES"},
    "Spanish (US)":        {"polly_voice": "Lupe",    "polly_code": "es-US"},
    "French (France)":     {"polly_voice": "Lea",     "polly_code": "fr-FR"},
    "French (Canada)":     {"polly_voice": "Chantal", "polly_code": "fr-CA"},
    "German":              {"polly_voice": "Marlene", "polly_code": "de-DE"},
    "Italian":             {"polly_voice": "Bianca",  "polly_code": "it-IT"},
    "Portuguese (Brazil)": {"polly_voice": "Vitoria", "polly_code": "pt-BR"},
    "Portuguese (EU)":     {"polly_voice": "Ines",    "polly_code": "pt-PT"},
    "Japanese":            {"polly_voice": "Mizuki",  "polly_code": "ja-JP"},
    "Korean":              {"polly_voice": "Seoyeon", "polly_code": "ko-KR"},
    "Chinese (Mandarin)":  {"polly_voice": "Zhiyu",   "polly_code": "cmn-CN"},
    "Arabic":              {"polly_voice": "Zeina",   "polly_code": "arb"},
    "Dutch":               {"polly_voice": "Lotte",   "polly_code": "nl-NL"},
    "Russian":             {"polly_voice": "Tatyana", "polly_code": "ru-RU"},
    "Turkish":             {"polly_voice": "Filiz",   "polly_code": "tr-TR"},
    "Swedish":             {"polly_voice": "Astrid",  "polly_code": "sv-SE"},
    "Norwegian":           {"polly_voice": "Liv",     "polly_code": "nb-NO"},
    "Danish":              {"polly_voice": "Naja",    "polly_code": "da-DK"},
    "Polish":              {"polly_voice": "Ewa",     "polly_code": "pl-PL"},
    "Romanian":            {"polly_voice": "Carmen",  "polly_code": "ro-RO"},
    "Welsh":               {"polly_voice": "Gwyneth", "polly_code": "cy-GB"},
    "Icelandic":           {"polly_voice": "Dora",    "polly_code": "is-IS"},
    "Tamil":               {"polly_voice": "Aditi",   "polly_code": "hi-IN"},
    "Telugu":              {"polly_voice": "Aditi",   "polly_code": "hi-IN"},
    "Catalan":             {"polly_voice": "Arlet",   "polly_code": "ca-ES"},
    "Finnish":             {"polly_voice": "Suvi",    "polly_code": "fi-FI"},
}

DEFAULT_LANG = LANGUAGE_CONFIG["English (US)"]

# ── Routes ───────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "MediScan AI Backend Running!"}


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    language: str = Form("English (US)"),
):
    try:
        print(f"📥 Received language: {language}")

        image_data = await file.read()
        image_b64  = base64.b64encode(image_data).decode("utf-8")
        client     = get_bedrock()
        lang_cfg   = LANGUAGE_CONFIG.get(language, DEFAULT_LANG)

        # ── Step 1: Vision ────────────────────────────────
        print("👁️ Calling Nova Vision...")
        vision_resp = client.invoke_model(
            modelId="amazon.nova-lite-v1:0",
            contentType="application/json",
            body=json.dumps({
                "messages": [{
                    "role": "user",
                    "content": [
                        {
                            "image": {
                                "format": "jpeg",
                                "source": {"bytes": image_b64}
                            }
                        },
                        {
                            "text": "What is the name of this medicine? Reply with only the medicine name, nothing else."
                        }
                    ]
                }]
            })
        )
        vision_result = json.loads(vision_resp["body"].read())
        medicine_name = vision_result["output"]["message"]["content"][0]["text"].strip()
        print(f"💊 Medicine detected: {medicine_name}")

        # ── Step 2: Text explanation ──────────────────────
        print(f"📝 Generating explanation in {language}...")
        prompt = f"""Respond entirely in {language} language.

Give detailed information about the medicine: {medicine_name}

Use EXACTLY this format (keep section labels in English):

MEDICINE: {medicine_name}

USES:
- use 1
- use 2

DOSAGE:
- dosage info

SIDE EFFECTS:
- side effect 1
- side effect 2

WARNINGS:
- warning 1
- warning 2

DISCLAIMER: This is for informational purposes only. Always consult a doctor."""

        text_resp = client.invoke_model(
            modelId="amazon.nova-micro-v1:0",
            contentType="application/json",
            body=json.dumps({
                "messages": [{
                    "role": "user",
                    "content": [{"text": prompt}]
                }]
            })
        )
        text_result  = json.loads(text_resp["body"].read())
        explanation  = text_result["output"]["message"]["content"][0]["text"].strip()
        print("✅ Explanation generated!")

        return {
            "medicine_name": medicine_name,
            "details":       explanation,
            "language":      language,
            "status":        "success"
        }

    except Exception as e:
        print(f"❌ Error in /analyze: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "status": "failed"}


@app.post("/speak")
async def speak(
    text:     str = Form(...),
    language: str = Form("English (US)"),
):
    try:
        print(f"🔊 Speak request — language: {language}")
        lang_cfg     = LANGUAGE_CONFIG.get(language, DEFAULT_LANG)
        client       = get_polly()
        text_trimmed = text[:2900] if len(text) > 2900 else text

        response = client.synthesize_speech(
            Text=text_trimmed,
            OutputFormat="mp3",
            VoiceId=lang_cfg["polly_voice"],
            LanguageCode=lang_cfg["polly_code"],
        )
        audio_bytes = response["AudioStream"].read()
        print("✅ Audio generated!")

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )

    except Exception as e:
        print(f"❌ Polly error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
