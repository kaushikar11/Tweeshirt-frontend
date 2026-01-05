# DeepFloyd IF API Setup Guide

## Overview
DeepFloyd IF is a Python-based text-to-image model that requires GPU resources. Since your Next.js frontend can't run Python directly, you'll need to set up a separate backend service.

## Option 1: Python Backend API (Recommended)

### Step 1: Create a Python Backend Service

Create a new directory for your Python backend:

```bash
mkdir deepfloyd-backend
cd deepfloyd-backend
```

### Step 2: Install Dependencies

Create `requirements.txt`:
```txt
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
pillow==10.1.0
deepfloyd-if==1.0.2rc0
xformers==0.0.16
torch>=2.0.0
transformers>=4.30.0
```

Install:
```bash
pip install -r requirements.txt
pip install git+https://github.com/openai/CLIP.git --no-deps
```

### Step 3: Get Hugging Face Token

1. Create account at https://huggingface.co/
2. Accept license for DeepFloyd IF models
3. Generate token at https://huggingface.co/settings/tokens
4. Add to `.env`:
```
HF_TOKEN=your_huggingface_token_here
```

### Step 4: Create FastAPI Server

Create `main.py`:
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
from io import BytesIO
from PIL import Image
import os
from deepfloyd_if.modules import IFStageI, IFStageII, StableStageIII
from deepfloyd_if.modules.t5 import T5Embedder
from deepfloyd_if.pipelines import dream
import torch

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
if_I = None
if_II = None
if_III = None
t5 = None
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'

class GenerateRequest(BaseModel):
    prompt: str
    style: str = "realistic"
    steps: int = 50

@app.on_event("startup")
async def load_models():
    global if_I, if_II, if_III, t5
    hf_token = os.getenv("HF_TOKEN")
    
    if not hf_token:
        raise ValueError("HF_TOKEN environment variable not set")
    
    print("Loading DeepFloyd IF models...")
    t5 = T5Embedder(device="cpu", hf_token=hf_token)
    if_I = IFStageI('IF-I-XL-v1.0', device=device, hf_token=hf_token)
    if_II = IFStageII('IF-II-L-v1.0', device=device, hf_token=hf_token)
    if_III = StableStageIII('stable-diffusion-x4-upscaler', device=device, hf_token=hf_token)
    print("Models loaded successfully!")

def image_to_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

@app.post("/generate")
async def generate_image(request: GenerateRequest):
    try:
        # Style modifiers
        style_modifiers = {
            "realistic": "photorealistic, highly detailed, professional photography, 8k, sharp focus",
            "animated": "animated style, vibrant colors, cartoon, illustration, digital art",
            "artistic": "artistic, creative, unique style, masterpiece, high quality art",
            "minimal": "minimalist, clean, simple, elegant design",
            "vintage": "vintage style, retro, classic, aged look",
        }
        
        enhanced_prompt = request.prompt
        if request.style in style_modifiers:
            enhanced_prompt = f"{request.prompt}, {style_modifiers[request.style]}"
        
        # Generate image
        result = dream(
            t5=t5,
            if_I=if_I,
            if_II=if_II,
            if_III=if_III,
            prompt=[enhanced_prompt],
            seed=42,
            if_I_kwargs={
                "guidance_scale": 7.0,
                "sample_timestep_respacing": "smart100",
            },
            if_II_kwargs={
                "guidance_scale": 4.0,
                "sample_timestep_respacing": "smart50",
            },
            if_III_kwargs={
                "guidance_scale": 2.0,
                "sample_timestep_respacing": "smart50",
            }
        )
        
        # Convert to base64
        image = result['III'][0]
        image_base64 = image_to_base64(image)
        
        return {
            "success": True,
            "image_0": image_base64,
            "prompt": enhanced_prompt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "models_loaded": if_I is not None}
```

### Step 5: Run the Backend

```bash
export HF_TOKEN=your_token_here
export FORCE_MEM_EFFICIENT_ATTN=1
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 6: Update Next.js API Route

Update `pages/api/generateImage.js` to call your Python backend:

```javascript
// Add this at the top
const DEEPFLOYD_API_URL = process.env.DEEPFLOYD_API_URL || 'http://localhost:8000';

// In the handler, replace the Stability AI call with:
const response = await fetch(`${DEEPFLOYD_API_URL}/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: enhancedPrompt,
    style: style || 'realistic',
    steps: 50,
  }),
});

const data = await response.json();
if (data.success) {
  const imageBase64 = data.image_0;
  // Continue with saving logic...
}
```

### Step 7: Add Environment Variable

Add to `.env.local`:
```
DEEPFLOYD_API_URL=http://localhost:8000
```

## Option 2: Use Hugging Face Inference API (Easier, but may have limitations)

If you want a simpler setup without running your own GPU server, you can use Hugging Face's Inference API:

1. Get your Hugging Face API token
2. Use their hosted inference endpoint

However, DeepFloyd IF may not be available as a hosted inference API yet.

## Option 3: Use Alternative Services

Consider these alternatives that provide REST APIs:
- **Replicate API** - Hosts various models including DeepFloyd IF
- **Stability AI** - Already integrated (current setup)
- **Midjourney API** - If available
- **DALL-E API** - OpenAI's service

## System Requirements

For Option 1 (Python Backend):
- **GPU with 24GB+ VRAM** (for full pipeline)
- **CUDA-compatible GPU**
- **Python 3.10**
- **Sufficient disk space** for models (~50GB)

## Quick Start with Replicate (Easiest)

If you want the easiest setup, use Replicate:

1. Sign up at https://replicate.com
2. Get API token
3. Update your API route to use Replicate's DeepFloyd IF model

Would you like me to implement the Replicate integration instead?

