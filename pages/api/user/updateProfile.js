import { getSession } from 'next-auth/react';
import { getFirestoreAdmin } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, email, image } = req.body;

    if (!email || email !== session.user.email) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Update user profile in Firestore
    const db = getFirestoreAdmin();
    const userRef = db.collection('users').doc(email);

    await userRef.set(
      {
        name: name || session.user.name,
        email: email,
        image: image || session.user.image || '',
        updatedAt: new Date(),
      },
      { merge: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: name || session.user.name,
        email: email,
        image: image || session.user.image,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}
