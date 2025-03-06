# MaculaCutis - AI Skin Lesion Analysis Tool

MaculaCutis is an AI-powered web application for analyzing skin lesions to assist in the early detection and diagnosis of skin conditions, including potential skin cancers.

## Features

- Upload skin lesion images for AI analysis
- Receive classification results with confidence scores
- View region analysis with heatmaps highlighting areas of concern
- User-friendly interface with responsive design
- Secure authentication system

## Current Status

⚠️ **Note:** The AI analysis endpoint is temporarily disabled to manage costs. The codebase is maintained and ready for reactivation when needed. All other features remain functional.

## Tech Stack

- **Frontend**: React + TypeScript
  - Shadcn UI components
  - TanStack Query for data fetching
  - React Hook Form for form management
  - Tailwind CSS for styling
  - Wouter for routing

- **Backend**: Node.js + Express
  - TypeScript for type safety
  - Google Cloud Vertex AI integration
  - Secure session management
  - Rate limiting and request validation

- **AI/ML**: Google Cloud AI Platform
  - Custom-trained model for skin lesion classification
  - Heatmap generation for region analysis
  - Configurable endpoint management

- **Database**: PostgreSQL with Drizzle ORM
  - Type-safe database operations
  - Efficient query optimization
  - Secure data persistence

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python 3.11 or later
- Google Cloud Platform account with Vertex AI enabled

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/skin-lesion-analyzer.git
cd skin-lesion-analyzer
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
GOOGLE_CREDENTIALS=your_google_credentials
```

4. Start the development server
```bash
npm run dev
```

## Architecture

The application follows a modern full-stack architecture:

- **Frontend Layer**: React components with TypeScript for type safety
- **API Layer**: Express routes with validation and error handling
- **Service Layer**: Business logic and AI model integration
- **Data Layer**: PostgreSQL with Drizzle ORM for type-safe queries

## Security Features

- HIPAA-compliant data handling
- Secure session management
- Input validation and sanitization
- Rate limiting on API endpoints
- Encrypted data transmission

## Development Guidelines

- Follow TypeScript best practices
- Write unit tests for critical components
- Use Prettier for code formatting
- Follow conventional commit messages

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## Deployment

The application is configured for deployment on Replit, with automatic scaling and HTTPS enabled.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy and Medical Disclaimer

MaculaCutis is a tool designed to assist medical professionals and should not be used as a replacement for professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.