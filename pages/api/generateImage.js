import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizeFilename(str) {
  return str
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 100);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { prompt, style, email } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }
    
    // Use email, username, or generate a unique identifier for file storage
    const userIdentifier = email || `user_${Date.now()}`;

    // Build enhanced prompt based on style
    let enhancedPrompt = prompt;
    const styleModifiers = {
      realistic: 'photorealistic, highly detailed, professional photography, 8k, sharp focus',
      animated: 'animated style, vibrant colors, cartoon, illustration, digital art',
      artistic: 'artistic, creative, unique style, masterpiece, high quality art',
      minimal: 'minimalist, clean, simple, elegant design',
      vintage: 'vintage style, retro, classic, aged look',
    };

    if (style && styleModifiers[style]) {
      enhancedPrompt = `${prompt}, ${styleModifiers[style]}`;
    }

    // Try FREE APIs first, then fallback to paid options
    let imageBase64;
    
    // Option 1: Pollinations.ai - 100% FREE, no API key needed, modern Stable Diffusion models
    try {
      // Pollinations supports multiple models: stable-diffusion, flux, etc.
      const model = style === 'realistic' ? 'flux' : 'stable-diffusion'; // flux is newer and better quality
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=${model}&width=1024&height=1024&seed=-1&enhance=true`;
      
      const pollinationsResponse = await fetch(pollinationsUrl);
      
      if (pollinationsResponse.ok) {
        const imageBuffer = await pollinationsResponse.arrayBuffer();
        imageBase64 = Buffer.from(imageBuffer).toString('base64');
        console.log('✅ Using Pollinations.ai (FREE)');
      }
    } catch (error) {
      console.log('Pollinations.ai error, trying next option:', error.message);
    }
    
    // Option 2: Hugging Face Inference API - FREE tier available
    if (!imageBase64 && process.env.HUGGINGFACE_API_KEY) {
      try {
        // Using Stable Diffusion XL or Flux models via Hugging Face
        const hfModel = 'stabilityai/stable-diffusion-xl-base-1.0'; // or 'black-forest-labs/FLUX.1-dev'
        const hfResponse = await fetch(
          `https://api-inference.huggingface.co/models/${hfModel}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            },
            body: JSON.stringify({
              inputs: enhancedPrompt,
              parameters: {
                width: 1024,
                height: 1024,
                num_inference_steps: 50,
                guidance_scale: 7.5,
              },
            }),
          }
        );

        if (hfResponse.ok) {
          const imageBuffer = await hfResponse.arrayBuffer();
          imageBase64 = Buffer.from(imageBuffer).toString('base64');
          console.log('✅ Using Hugging Face Inference API (FREE tier)');
        } else if (hfResponse.status === 503) {
          // Model is loading, wait and retry
          await new Promise(resolve => setTimeout(resolve, 10000));
          const retryResponse = await fetch(
            `https://api-inference.huggingface.co/models/${hfModel}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              },
              body: JSON.stringify({ inputs: enhancedPrompt }),
            }
          );
          if (retryResponse.ok) {
            const imageBuffer = await retryResponse.arrayBuffer();
            imageBase64 = Buffer.from(imageBuffer).toString('base64');
            console.log('✅ Using Hugging Face Inference API (FREE tier) - after retry');
          }
        }
      } catch (error) {
        console.log('Hugging Face API error, trying next option:', error.message);
      }
    }
    
    // Option 3: Custom DeepFloyd Backend API (if you have your own GPU server)
    if (!imageBase64 && process.env.DEEPFLOYD_API_URL) {
      try {
        const deepfloydResponse = await fetch(`${process.env.DEEPFLOYD_API_URL}/generate`, {
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

        if (deepfloydResponse.ok) {
          const deepfloydData = await deepfloydResponse.json();
          if (deepfloydData.success && deepfloydData.image_0) {
            imageBase64 = deepfloydData.image_0;
            console.log('✅ Using Custom DeepFloyd Backend');
          }
        }
      } catch (error) {
        console.log('DeepFloyd API error, trying next option:', error.message);
      }
    }
    
    // Option 4: Stability AI (paid, but you already have it configured)
    if (!imageBase64) {
      const API_HOST = process.env.API_HOST || 'https://api.stability.ai';
      const apiKey = process.env.STABILITY_API_KEY_JEIS_2;

      if (!apiKey) {
        throw new Error('No free API available. Please configure HUGGINGFACE_API_KEY (free) or STABILITY_API_KEY_JEIS_2 (paid).');
      }

      const response = await fetch(`${API_HOST}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: enhancedPrompt,
              weight: 1,
            },
            {
              text: 'blurry, bad quality, distorted, disfigured, low resolution',
              weight: -1,
            },
          ],
          height: 1024,
          width: 1024,
          steps: 50,
          samples: 1,
          cfg_scale: 7,
          style_preset: style === 'artistic' ? 'enhance' : undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const responseJSON = await response.json();
      imageBase64 = responseJSON.artifacts[0].base64;
      console.log('✅ Using Stability AI (paid)');
    }

    // Generate timestamp and filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedPrompt = sanitizeFilename(prompt);
    const filename = `${timestamp}_${sanitizedPrompt}.png`;

    // Create user directory structure: public/gen_images/{userIdentifier}/
    const userDir = path.join(process.cwd(), 'public', 'gen_images', userIdentifier);
    await ensureDirectoryExists(userDir);

    // Save image to file
    const filePath = path.join(userDir, filename);
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(filePath, imageBuffer);

    // Return image data and metadata
    res.status(200).json({
      success: true,
      image_0: imageBase64,
      timestamp,
      filename,
      prompt: enhancedPrompt,
      style,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate image',
    });
  }
}
