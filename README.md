# Fashion Designer Agent Platform - Landing Page

A comprehensive landing page for the AI-powered fashion designer platform, built with React, FastAPI, and Supabase.

## 🚀 Features

- **Responsive Design**: Fully responsive landing page optimized for all devices
- **AI-Powered Content**: Dynamic content delivery through FastAPI backend
- **Modern UI/UX**: Built with React, TypeScript, and Tailwind CSS
- **Smooth Animations**: Framer Motion animations for enhanced user experience
- **Database Integration**: Supabase for real-time data management
- **Comprehensive Testing**: Unit tests for both frontend and backend components

## 🏗️ Architecture

### Frontend (React + TypeScript + Tailwind CSS)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React for consistent iconography
- **Testing**: Vitest + React Testing Library
- **Build Tool**: Vite for fast development and building

### Backend (FastAPI + Python)
- **Framework**: FastAPI for high-performance API
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth integration ready
- **Testing**: Pytest for comprehensive API testing
- **CORS**: Configured for cross-origin requests

### Database (Supabase/PostgreSQL)
- **Featured Collections**: Showcase designer collections
- **News Items**: Latest platform updates and news
- **User Management**: Ready for authentication integration
- **Platform Statistics**: Real-time metrics display

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Supabase account (for database)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

### Database Setup

1. Create a new Supabase project
2. Run the schema setup:
   ```sql
   -- Execute the contents of database/schema.sql in your Supabase SQL editor
   ```
3. Seed the database:
   ```sql
   -- Execute the contents of database/seed.sql in your Supabase SQL editor
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Frontend Configuration

The frontend automatically connects to the backend at `http://localhost:8000`. For production, update the API base URL in `frontend/src/services/api.ts`.

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
The FastAPI backend can be deployed to:
- **Heroku**: Use the included `Procfile`
- **Railway**: Direct deployment from Git
- **DigitalOcean App Platform**: Configure with Python buildpack
- **AWS Lambda**: Use Mangum adapter

### Database
Supabase handles database hosting and scaling automatically.

## 📱 API Endpoints

### Public Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/collections/featured` - Get featured collections
- `GET /api/news` - Get latest news (with optional limit parameter)
- `GET /api/stats` - Get platform statistics

### Response Examples

**Featured Collections:**
```json
[
  {
    "id": 1,
    "title": "Ethereal Dreams",
    "description": "A collection inspired by celestial beauty...",
    "image_url": "https://example.com/image.jpg",
    "designer": "Luna Martinez"
  }
]
```

**Platform Stats:**
```json
{
  "total_designers": 15420,
  "total_collections": 8750,
  "total_users": 45680
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`from-blue-600 to-purple-600`)
- **Secondary**: Gray scale for text and backgrounds
- **Accent**: Various colors for features and highlights

### Typography
- **Headings**: Bold, large sizes with proper hierarchy
- **Body**: Readable font sizes with good contrast
- **Interactive**: Hover states and transitions

### Components
- **Responsive Grid**: Mobile-first approach
- **Cards**: Consistent styling with shadows and hover effects
- **Buttons**: Primary, secondary, and outline variants
- **Navigation**: Sticky header with mobile menu

## 🔒 Security

- **CORS**: Properly configured for cross-origin requests
- **Row Level Security**: Enabled on all database tables
- **Input Validation**: Pydantic models for API validation
- **Environment Variables**: Sensitive data stored securely

## 📈 Performance

- **Lazy Loading**: Images and components loaded on demand
- **Code Splitting**: Automatic code splitting with Vite
- **Caching**: API responses cached where appropriate
- **Optimized Images**: Responsive images with proper sizing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/docs` when running the backend

## 🔄 Updates

The platform is actively maintained with regular updates for:
- Security patches
- Performance improvements
- New features and components
- Bug fixes and optimizations