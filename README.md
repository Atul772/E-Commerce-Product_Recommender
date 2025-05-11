# E-Commerce Product Recommender

A modern e-commerce web application with intelligent product recommendation features, built with React, Vite, and Firebase.

## Features

- Smart product recommendations based on user behavior and preferences
- Personalized shopping experience
- Product browsing and search
- User authentication
- Shopping cart functionality
- Responsive design with Tailwind CSS
- Firebase integration for backend services

## Tech Stack

- React 18
- Vite 6
- Firebase 11
- React Router 7
- Tailwind CSS 4
- React Toastify for notifications

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Atul772/E-Commerce-Product-Recommender.git
   cd E-Commerce-Product-Recommender
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 to view the app in your browser

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Deployment

1. Build the project
   ```bash
   npm run build
   ```

2. Deploy to your preferred hosting service (Firebase, Vercel, Netlify, etc.)

## Environment Variables

Create a `.env` file in the root directory with the following Firebase configuration:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Firebase Setup

The project uses Firebase for backend services. Follow these steps to set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Storage services
3. Copy your Firebase configuration (available in Project Settings)
4. Add the configuration to your `.env` file as shown above
5. For local development, the Firebase configuration in `src/components/firebase.jsx` includes fallback values
6. Before deploying to production, ensure all Firebase credentials are properly set in environment variables

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Product Recommendation Engine

The application features an intelligent product recommendation system that:

- Analyzes user browsing history
- Tracks product interactions (views, purchases)
- Utilizes collaborative filtering algorithms
- Provides personalized product suggestions
- Increases conversion through targeted recommendations

### How It Works

1. Data Collection: Captures user behavior and preferences
2. Analysis: Processes data to identify patterns and preferences
3. Recommendation Generation: Creates personalized product suggestions
4. Presentation: Displays recommendations across the shopping experience
