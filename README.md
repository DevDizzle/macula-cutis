
# MaculaCutis - AI Skin Lesion Analysis Tool

MaculaCutis is an AI-powered web application for analyzing skin lesions to assist in the early detection and diagnosis of skin conditions, including potential skin cancers.

## Features

- Upload skin lesion images for AI analysis
- Receive classification results with confidence scores
- View region analysis with heatmaps highlighting areas of concern
- User-friendly interface with responsive design
- Secure authentication system

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **AI/ML**: Google Cloud AI Platform for image classification
- **Image Processing**: Python with matplotlib for heatmap generation
- **Database**: Drizzle ORM with Neon PostgreSQL

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python 3.11 or later
- Google Cloud Platform account with Vertex AI enabled

### Installation

1. Clone the repository
```bash
git clone https://github.com/DevDizzle/macula-cutis.git
cd macula-cutis
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
GOOGLE_CREDENTIALS=your_google_credentials
```

4. Start the development server
```bash
npm run dev
```

### Usage

1. Navigate to the application in your browser
2. Upload a skin lesion image
3. View the analysis results, including classification and region analysis

## Deployment

The application can be deployed on Replit.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Privacy and Medical Disclaimer

MaculaCutis is a tool designed to assist medical professionals and should not be used as a replacement for professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
