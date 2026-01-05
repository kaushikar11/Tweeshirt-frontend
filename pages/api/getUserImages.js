import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Get user directory
    const userDir = path.join(process.cwd(), 'public', 'gen_images', email);

    // Check if directory exists
    if (!fs.existsSync(userDir)) {
      return res.status(200).json({ success: true, images: [] });
    }

    // Read all files in directory
    const files = fs.readdirSync(userDir);
    
    // Filter for image files and get metadata
    const images = files
      .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
      .map(file => {
        const filePath = path.join(userDir, file);
        const stats = fs.statSync(filePath);
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString('base64');
        
        // Extract prompt from filename (format: timestamp_prompt.png)
        const filenameWithoutExt = file.replace(/\.(png|jpg|jpeg|webp)$/i, '');
        const parts = filenameWithoutExt.split('_');
        const timestamp = parts[0];
        const prompt = parts.slice(1).join('_').replace(/-/g, ' ');

        return {
          filename: file,
          prompt: prompt || 'Untitled',
          timestamp: timestamp,
          created: stats.birthtime,
          modified: stats.mtime,
          size: stats.size,
          image: base64,
          url: `/gen_images/${email}/${file}`,
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created)); // Sort by newest first

    res.status(200).json({
      success: true,
      images,
      count: images.length,
    });
  } catch (error) {
    console.error('Error fetching user images:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch images',
    });
  }
}

