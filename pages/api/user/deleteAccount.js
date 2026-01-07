import { getSession } from 'next-auth/react';
import { getFirestoreAdmin } from '../../../lib/firebaseAdmin';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email } = req.body;

    if (!email || email !== session.user.email) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const db = getFirestoreAdmin();
    const userRef = db.collection('users').doc(email);

    // Delete all user's images from Cloudinary
    try {
      const result = await cloudinary.api.delete_resources_by_prefix(`tweeshirt/${email}`);
      console.log('Deleted from Cloudinary:', result);
    } catch (cloudError) {
      console.error('Error deleting from Cloudinary:', cloudError);
      // Continue even if Cloudinary delete fails
    }

    // Delete user's images collection from Firestore
    const imagesSnapshot = await userRef.collection('images').get();
    for (const doc of imagesSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete user's orders collection from Firestore
    const ordersSnapshot = await userRef.collection('orders').get();
    for (const doc of ordersSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete user document from Firestore
    await userRef.delete();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}
