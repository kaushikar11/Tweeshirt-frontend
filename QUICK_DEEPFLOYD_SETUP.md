# Quick DeepFloyd IF Setup Guide

## 🚀 Easiest Option: Replicate API (Recommended)

### Step 1: Sign up for Replicate
1. Go to https://replicate.com
2. Create an account
3. Go to https://replicate.com/account/api-tokens
4. Copy your API token

### Step 2: Add to `.env.local`
```bash
REPLICATE_API_TOKEN=your_replicate_token_here
```

### Step 3: Done! 
The code will automatically use Replicate's DeepFloyd IF model.

---

## 🖥️ Option 2: Custom Python Backend (For Full Control)

### Requirements:
- GPU with 24GB+ VRAM
- Python 3.10
- CUDA setup

### Steps:

1. **Create backend directory:**
```bash
mkdir deepfloyd-backend && cd deepfloyd-backend
```

2. **Install dependencies:**
```bash
pip install fastapi uvicorn python-multipart pillow
pip install deepfloyd-if==1.0.2rc0
pip install xformers==0.0.16
pip install git+https://github.com/openai/CLIP.git --no-deps
```

3. **Get Hugging Face token:**
   - Sign up at https://huggingface.co
   - Accept DeepFloyd IF license
   - Create token at https://huggingface.co/settings/tokens

4. **Create `main.py`** (see DEEPFLOYD_SETUP.md for full code)

5. **Run backend:**
```bash
export HF_TOKEN=your_hf_token
export FORCE_MEM_EFFICIENT_ATTN=1
uvicorn main:app --host 0.0.0.0 --port 8000
```

6. **Add to `.env.local`:**
```bash
DEEPFLOYD_API_URL=http://localhost:8000
```

---

## 📝 Current Setup

The code now supports **3 options** (in priority order):
1. **Replicate API** - Easiest, no GPU needed
2. **Custom DeepFloyd Backend** - Full control, requires GPU
3. **Stability AI** - Fallback (current default)

Just add the appropriate environment variable and it will work!

---

## 🔍 Check What's Being Used

The API will log which service it's using. Check your server logs to see:
- "Replicate API error, falling back..." = Using Stability AI
- "DeepFloyd API error, falling back..." = Using Stability AI
- No errors = Using your configured service

