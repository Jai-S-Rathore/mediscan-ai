# ⚕ MediScan AI
### AI-Powered Medicine Recognition & Safety Assistant

Built for **Amazon Nova AI Hackathon**

## 🎯 Problem
Millions of people — especially in rural India — cannot identify 
medicines or understand usage, leading to dangerous misuse.

## ✅ Solution
MediScan AI uses Amazon Nova Vision to identify medicines from 
photos and provides complete safety information in 30 languages 
with voice output.

## 🚀 Features
- 📷 Medicine image recognition — Amazon Nova Vision
- 💊 AI explanation — Uses, Dosage, Side Effects, Warnings
- 🌍 30 languages supported
- 🔊 Voice output — Amazon Polly
- 📍 Auto location detection — UI switches to native language
- 🦮 Accessibility for rural & visually impaired users
# ⚕ MediScan AI
### AI-Powered Medicine Recognition & Safety Assistant

Built for **Amazon Nova AI Hackathon**

## 🎯 Problem
Millions of people — especially in rural India — cannot identify 
medicines or understand usage, leading to dangerous misuse.

## ✅ Solution
MediScan AI uses Amazon Nova Vision to identify medicines from 
photos and provides complete safety information in 30 languages 
with voice output.

## 🚀 Features
- 📷 Medicine image recognition — Amazon Nova Vision
- 💊 AI explanation — Uses, Dosage, Side Effects, Warnings
- 🌍 30 languages supported
- 🔊 Voice output — Amazon Polly
- 📍 Auto location detection — UI switches to native language
- 🦮 Accessibility for rural & visually impaired users

## 🛠️ Tech Stack
| Technology | Purpose |
|------------|---------|
| Amazon Nova Vision | Medicine image recognition |
| Amazon Nova Text | Generate explanation |
| Amazon Polly | Text-to-speech (30 languages) |
| Amazon Bedrock | AI model hosting |
| FastAPI + Python | Backend API |
| React + Vite | Frontend UI |
| OpenStreetMap | Location detection |

## 🏗️ Architecture
```
User uploads medicine image
↓
React Frontend
↓
FastAPI Backend
↓
Amazon Bedrock
↓
Nova Vision → identifies medicine
Nova Text → generates explanation
↓
Amazon Polly → converts to voice
↓
Result shown in user's native language
```

## ⚙️ Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
# Add your AWS keys to .env
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ⚕️ Disclaimer
For informational purposes only. Always consult a licensed doctor.
## 🛠️ Tech Stack
| Technology | Purpose |
|------------|---------|
| Amazon Nova Vision | Medicine image recognition |
| Amazon Nova Text | Generate explanation |
| Amazon Polly | Text-to-speech (30 languages) |
| Amazon Bedrock | AI model hosting |
| FastAPI + Python | Backend API |
| React + Vite | Frontend UI |
| OpenStreetMap | Location detection |

## 🏗️ Architecture
```
User uploads medicine image
↓
React Frontend
↓
FastAPI Backend
↓
Amazon Bedrock
↓
Nova Vision → identifies medicine
Nova Text → generates explanation
↓
Amazon Polly → converts to voice
↓
Result shown in user's native language
```

## ⚙️ Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
# Add your AWS keys to .env
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ⚕️ Disclaimer
For informational purposes only. Always consult a licensed doctor.