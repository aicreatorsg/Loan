# Member Management System

A React-based member management system built with Material-UI and Firebase. This application helps manage member information, track loans, interest, and installments, and generate reports.

## Features

- Member management (add, edit, view)
- Real-time updates using Firebase
- Loan and installment tracking
- Interest calculations
- Report generation (CSV export)
- Responsive Material-UI design
- Authentication system

## Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/member-management.git
cd member-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Fill in your Firebase configuration details

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Set up Authentication if needed
4. Copy your Firebase configuration to the `.env` file

## Technologies Used

- React
- Vite
- Material-UI
- Firebase/Firestore
- React Router

## License

MIT
