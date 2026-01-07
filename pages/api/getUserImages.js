import { getFirestoreAdmin } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Get images metadata from Firestore for this user
    const db = getFirestoreAdmin();
    const userImagesRef = db.collection('users').doc(email).collection('images');
    const snapshot = await userImagesRef.orderBy('created', 'desc').get();

    if (snapshot.empty) {
      return res.status(200).json({ success: true, images: [], count: 0 });
    }

    // Build images array from Firestore metadata
    const images = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        filename: data.filename,
        prompt: data.prompt,
        enhancedPrompt: data.enhancedPrompt || '',
        style: data.style || '',
        timestamp: data.timestamp,
        created: data.created?.toDate?.() || new Date(data.timestamp),
        url: data.cloudinaryUrl || '', // Direct Cloudinary URL
        contentType: data.contentType || 'image/png',
      };
    });

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

