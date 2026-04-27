# SentinelAI — Google Solution Challenge 2025

AI-powered digital asset protection platform for sports organizations.

## Problem statement
Sports organizations generate massive volumes of high-value digital media that rapidly scatter across global platforms, leaving proprietary content vulnerable to widespread misappropriation and unauthorized redistribution.

## Solution
SentinelAI detects unauthorized use of sports media across the internet in near real-time using perceptual fingerprinting and Gemini AI.

## Repository structure
## Tech stack
- **Backend**: Go 1.22, Gin, Firebase Firestore, Gemini 2.0 Flash, YouTube Data API
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication + JWT
- **AI**: Google Gemini 2.0 Flash
- **Deployment**: Firebase Hosting + Railway

## SDG Alignment
SDG 16 — Peace, Justice and Strong Institutions

## Setup

### Backend
```bash
cd dap-backend
cp .env.example .env
# Fill in your API keys
go mod tidy
go build -o sentinel.exe .
.\sentinel.exe
```

### Frontend
```bash
cd sentinel-frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## Team
Built for Google Solution Challenge 2025