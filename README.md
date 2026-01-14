# Tweeshirt Frontend

A modern Next.js application that transforms tweets into custom t-shirt designs using AI image generation.

## 🚀 Features

- **Twitter OAuth 2.0 Authentication** - Sign in with Twitter to access your account
- **AI-Powered Design Generation** - Create unique t-shirt designs from text prompts or tweets
- **Tweet Integration** - Fetch and select from your Twitter timeline or manually paste tweets
- **Design Gallery** - View, manage, and order your generated designs
- **Custom Design Tool** - Position and resize designs on t-shirts
- **Order Management** - Complete order flow with shipping details and payment
- **Order History** - Track all your past orders

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Authentication:** NextAuth.js (Twitter OAuth 2.0)
- **Styling:** Tailwind CSS
- **UI Components:** Custom components (Card, Button, Input, etc.)
- **Image Storage:** Cloudinary
- **Database:** Firestore (Firebase Admin SDK)
- **Icons:** Lucide React

## 📋 Prerequisites

- Node.js >= 18.x
- npm or yarn
- Twitter Developer Account (for OAuth)
- Cloudinary account (for image storage)
- Firebase project with Firestore enabled
- Backend API running (see [Backend README](../Tweeshirt-backend/README.md))

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Twitter OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_BEARER_TOKEN=your-twitter-bearer-token

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   cd Tweeshirt-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local` (if available)
   - Fill in all required environment variables

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Tweeshirt-frontend/
├── components/          # Reusable UI components
│   ├── Alert.js        # Alert/notification component
│   ├── Background.js   # Background component
│   ├── Button.js       # Button component
│   ├── Card.js         # Card component
│   ├── HeaderElements.js # Header navigation
│   ├── Input.js        # Form input components
│   ├── PromptForm.js   # Design creation form
│   └── ...
├── lib/                # Utility libraries
│   ├── firebase.js     # Firebase client config
│   ├── firebaseAdmin.js # Firebase admin config
│   └── utils.js        # Utility functions
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   ├── auth/       # NextAuth configuration
│   │   ├── deleteImage.js
│   │   ├── generateImage.js
│   │   ├── getUserImages.js
│   │   ├── getUserTweets.js
│   │   └── getOrders.js
│   ├── _app.js         # App wrapper
│   ├── _document.js    # Document wrapper
│   ├── index.js        # Landing page
│   ├── image.js        # Design creation page
│   ├── gallery.js      # Design gallery
│   ├── App.js          # Order/checkout flow
│   └── orders.js       # Order history
├── public/             # Static assets
│   ├── logos/          # Logo files
│   └── gen_images/     # Generated images
├── styles/             # Global styles
│   └── global.css
└── package.json
```

## 🔑 Key Features

### Authentication
- Twitter OAuth 2.0 integration
- Session management with NextAuth.js
- Protected routes and API endpoints

### Image Generation
- AI-powered image generation from prompts
- Support for custom designs and tweets
- Multiple style options (realistic, animated, artistic, minimal, vintage)
- Image positioning and resizing tools

### Design Management
- Gallery view of all generated designs
- Delete designs from Cloudinary
- Order designs directly from gallery

### Order Flow
- T-shirt customization (color, size, design position)
- Shipping address collection
- Price calculation with breakdown
- Order submission to backend

## 🧪 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 API Routes

- `/api/auth/[...nextauth]` - NextAuth authentication endpoints
- `/api/generateImage` - Generate AI images
- `/api/getUserImages` - Fetch user's generated images
- `/api/deleteImage` - Delete images from Cloudinary and Firestore
- `/api/getUserTweets` - Fetch user's Twitter timeline
- `/api/getOrders` - Fetch user's order history

## 🚢 Deployment

The application is configured for deployment on Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## 📄 License

ISC

## 👤 Author

Kaushik Alaguvadivel Ramya
