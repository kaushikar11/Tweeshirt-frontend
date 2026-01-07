import { getSession } from 'next-auth/react';
import { getFirestoreAdmin } from '../../lib/firebaseAdmin';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email, filename } = req.body;

    if (!email || email !== session.user.email) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Delete metadata from Firestore and remove from Cloudinary if public id exists
    const db = getFirestoreAdmin();
    const userImagesRef = db.collection('users').doc(email).collection('images');

    const docRef = userImagesRef.doc(filename);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data();
      const cloudinaryPublicId = data?.cloudinaryPublicId;

      if (cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(cloudinaryPublicId);
        } catch (cloudError) {
          console.error('Error deleting from Cloudinary:', cloudError);
          // Continue even if Cloudinary delete fails
        }
      }

      await docRef.delete();
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
}
