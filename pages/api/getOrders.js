import { getSession } from 'next-auth/react';
import { getFirestoreAdmin } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email } = req.query;

    if (!email || email !== session.user.email) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Fetch orders from Firestore for this user
    const db = getFirestoreAdmin();
    const userOrdersRef = db.collection('users').doc(email).collection('orders');

    const snapshot = await userOrdersRef.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        orders: [],
        count: 0,
      });
    }

    // Build orders array
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      };
    });

    res.status(200).json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}
