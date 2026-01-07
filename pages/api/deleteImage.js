import { getServerSession } from 'next-auth/next';
import { getFirestoreAdmin } from '../../lib/firebaseAdmin';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from './auth/[...nextauth]';

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
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ success: false, error: 'Please sign in to delete a design.' });
    }

    const { imageId, filename } = req.body || {};

    if (!imageId && !filename) {
      return res.status(400).json({ success: false, error: 'Please select a design to delete.' });
    }

    // Delete metadata from Firestore and remove from Cloudinary if possible.
    // We DO NOT trust client-provided email; we derive owner from the session.
    const db = getFirestoreAdmin();
    const docId = imageId || filename;
    const sessionEmail = session.user?.email;
    const sessionUsername = session.user?.username;
    const sessionId = session.user?.id;

    const candidateUserIds = [
      sessionEmail,
      sessionUsername ? `${sessionUsername}@twitter.com` : null,
      sessionUsername,
      sessionId,
      sessionId ? `user_${sessionId}@twitter.com` : null,
    ].filter(Boolean);

    let docRef = null;
    let doc = null;
    for (const userId of candidateUserIds) {
      const ref = db.collection('users').doc(userId).collection('images').doc(docId);
      // eslint-disable-next-line no-await-in-loop
      const snap = await ref.get();
      if (snap.exists) {
        docRef = ref;
        doc = snap;
        break;
      }
    }

    if (!docRef || !doc || !doc.exists) {
      return res.status(404).json({ success: false, error: 'Design not found (it may have already been deleted).' });
    }

    const data = doc.data();
    const cloudinaryPublicId = data?.cloudinaryPublicId;
    const cloudinaryUrl = data?.cloudinaryUrl;

    // Best-effort Cloudinary delete
    const hasCloudinaryCreds =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET;

    let storageDeleted = false;
    if (hasCloudinaryCreds) {
      // Determine public id (prefer stored field)
      let publicId = cloudinaryPublicId;
      if (!publicId && cloudinaryUrl) {
        try {
          const urlWithoutQuery = cloudinaryUrl.split('?')[0];
          const afterUpload = urlWithoutQuery.split('/upload/')[1] || '';
          // afterUpload: v1234/folder/name.png OR folder/name.png
          const withoutVersion = afterUpload.replace(/^v\d+\//, '');
          publicId = withoutVersion.replace(/\.[^/.]+$/, '');
        } catch {
          publicId = null;
        }
      }

      if (publicId) {
        // Try common resource types. Upload used resource_type: 'auto', but destroy needs a concrete type.
        const resourceTypes = ['image', 'raw', 'video'];
        for (const resource_type of resourceTypes) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const result = await cloudinary.uploader.destroy(publicId, { 
              resource_type,
              invalidate: true // Clear CDN cache
            });
            if (result?.result === 'ok' || result?.result === 'not found') {
              // ok => deleted; not found => already gone
              storageDeleted = result?.result === 'ok' || storageDeleted;
              break;
            }
          } catch {
            // keep trying other resource types
          }
        }
      }
    }

    // Delete from Firestore
    await docRef.delete();

    res.status(200).json({
      success: true,
      message: storageDeleted
        ? 'Design deleted.'
        : 'Design removed from your gallery. Storage cleanup may take a moment.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Could not delete the design. Please try again.' });
  }
}
