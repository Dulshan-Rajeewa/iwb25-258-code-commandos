# MediHunt 🏥

A comprehensive medicine finder application that helps users locate medicines and pharmacies in their area. Built with modern web technologies and powered by Supabase for real-time data management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Usage](#usage)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🏪 Pharmacy Management
- Pharmacy registration and authentication
- Profile management with image uploads
- Medicine inventory management
- Real-time inventory updates

### 💊 Medicine Search & Discovery
- Advanced medicine search by name and location
- Location-based pharmacy discovery
- Medicine details with images and pricing
- Real-time availability status

### 👤 User Experience
- Intuitive search interface
- Responsive design for all devices
- Real-time search results
- Medicine image display
- Pharmacy contact information

### 🔐 Security & Authentication
- JWT-based authentication
- Secure password hashing
- Role-based access control
- Session management

### 📊 Analytics & Insights
- Pharmacy dashboard with analytics
- Medicine inventory tracking
- Sales and availability insights
- Performance metrics

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Ballerina** - Cloud-native programming language
- **Supabase** - PostgreSQL database with real-time features
- **JWT** - JSON Web Token authentication
- **RESTful APIs** - Clean API design

### Database
- **PostgreSQL** (via Supabase)
- **Real-time subscriptions**
- **Row Level Security (RLS)**
- **Automatic API generation**

### DevOps & Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **npm/yarn** - Package management

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Ballerina** (v2201.8.0 or later) - [Download](https://ballerina.io/)
- **Java 11** or later (required for Ballerina)
- **Git** - [Download](https://git-scm.com/)

### Optional but Recommended
- **VS Code** with extensions:
  - Ballerina
  - TypeScript and JavaScript
  - Tailwind CSS IntelliSense
  - Prettier
- **Supabase CLI** for local development

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Dulshan-Rajeewa/medi-hunt.git
cd medi-hunt
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Ballerina dependencies (if any)
# Note: Ballerina manages dependencies automatically

# Start the backend server
bal run
```

The backend will start on `http://localhost:9090`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Database Setup

1. **Create a Supabase Project**
   - Go to [Supabase](https://supabase.com/)
   - Create a new project
   - Note down your project URL and API keys

2. **Run Database Migrations**
   ```sql
   -- Execute these in your Supabase SQL Editor
   -- Copy from backend/schema.sql and backend/README_DATABASE_UPDATES.md
   ```

## 📁 Project Structure

```
medi-hunt/
├── backend/                          # Ballerina backend
│   ├── main.bal                      # Main application file
│   ├── schema.sql                    # Database schema
│   ├── Dependencies.toml             # Ballerina dependencies
│   ├── Ballerina.toml               # Ballerina configuration
│   ├── fix_image_storage.sql         # Database fix script
│   └── README_DATABASE_UPDATES.md    # Database migration guide
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   ├── SearchSection.tsx    # Search interface
│   │   │   ├── SearchResults.tsx    # Search results display
│   │   │   ├── PharmacyDashboard.tsx # Pharmacy management
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── pages/                   # Page components
│   │   │   ├── Index.tsx            # Home page
│   │   │   ├── About.tsx            # About page
│   │   │   └── HowItWorks.tsx       # How it works page
│   │   ├── lib/                     # Utilities and API
│   │   │   ├── api.ts               # API client
│   │   │   └── utils.ts             # Utility functions
│   │   ├── hooks/                   # Custom React hooks
│   │   └── assets/                  # Static assets
│   ├── package.json                 # Dependencies and scripts
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.ts           # Tailwind configuration
│   └── index.html                   # HTML template
├── README.md                         # Project documentation
└── .gitignore                       # Git ignore rules
```

## ⚙️ Configuration

### Environment Variables

Create environment files for both frontend and backend:

#### Backend (.env or configurable variables)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
SERVER_PORT=9090
```

#### Frontend (.env.local)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:9090/api/v1

# Supabase Configuration (if needed)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Ballerina Configuration

Update `backend/main.bal` with your Supabase credentials:

```ballerina
configurable string supabaseUrl = "https://your-project.supabase.co";
configurable string supabaseKey = "your-service-role-key";
```

## 🗄️ Database Setup

### 1. Create Tables

Run the SQL script from `backend/schema.sql` in your Supabase SQL Editor:

```sql
-- This creates all necessary tables
-- Copy and paste the entire schema.sql content
```

### 2. Apply Updates

If you're migrating from an older version, run the updates from `backend/README_DATABASE_UPDATES.md`:

```sql
-- Add image_url column and indexes
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_medicines_image_url ON medicines(image_url);
```

### 3. Fix Image Storage Issues

If you encounter database index errors with large images, run:

```sql
-- Remove problematic index
DROP INDEX IF EXISTS idx_medicines_image_url;

-- Remove URL validation constraint
ALTER TABLE medicines DROP CONSTRAINT IF EXISTS check_image_url;

-- Add comment for clarity
COMMENT ON COLUMN medicines.image_url IS 'Stores base64 encoded images or image URLs';
```

## 📚 API Documentation

### Base URL
```
http://localhost:9090/api/v1
```

### Authentication Endpoints

#### Pharmacy Login
```http
POST /auth/pharmacy/login
Content-Type: application/json

{
  "email": "pharmacy@example.com",
  "password": "password123"
}
```

#### Pharmacy Registration
```http
POST /auth/pharmacy/register
Content-Type: application/json

{
  "name": "City Pharmacy",
  "email": "pharmacy@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "license_number": "PH001"
}
```

### Medicine Management

#### Get All Medicines
```http
GET /medicines
Authorization: Bearer <token>
```

#### Add Medicine
```http
POST /medicines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Paracetamol",
  "description": "Pain relief medication",
  "category": "Pain Relief",
  "price": 25.50,
  "stockQuantity": 100,
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

#### Update Medicine
```http
PUT /medicines/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Paracetamol 500mg",
  "price": 26.00
}
```

#### Upload Medicine Image
```http
POST /uploadMedicineImage
Authorization: Bearer <token>
Content-Type: application/json

{
  "medicine_id": "med-001",
  "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

### Search Endpoints

#### Basic Search
```http
POST /search
Content-Type: application/json

{
  "medicineName": "Paracetamol",
  "location": "New York"
}
```

#### Location-Based Search
```http
POST /search/location
Content-Type: application/json

{
  "medicineName": "Paracetamol",
  "country": "United States",
  "state": "New York",
  "city": "New York City"
}
```

### Pharmacy Endpoints

#### Get Pharmacy Info
```http
GET /pharmacyInfo
Authorization: Bearer <token>
```

#### Update Pharmacy Profile
```http
PUT /pharmacyInfo
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Pharmacy Name",
  "phone": "+1987654321",
  "profile_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

## 🎯 Usage

### For Users

1. **Search for Medicines**
   - Visit the home page
   - Enter medicine name and location
   - Browse search results with pharmacy details
   - Contact pharmacies directly

2. **View Medicine Details**
   - See medicine images, prices, and availability
   - Get pharmacy contact information
   - View pharmacy locations

### For Pharmacies

1. **Register Your Pharmacy**
   - Create account with pharmacy details
   - Upload pharmacy logo/profile image
   - Set up your profile

2. **Manage Inventory**
   - Add medicines with details and images
   - Update stock quantities and prices
   - Track medicine availability

3. **Dashboard Analytics**
   - View inventory statistics
   - Monitor medicine categories
   - Track stock levels

## 💻 Development

### Running in Development Mode

#### Backend
```bash
cd backend
bal run --debug
```

#### Frontend
```bash
cd frontend
npm run dev
```

### Building for Production

#### Backend
```bash
cd backend
bal build
```

#### Frontend
```bash
cd frontend
npm run build
```

### Testing

#### Backend
```bash
cd backend
bal test
```

#### Frontend
```bash
cd frontend
npm run test
```

### Code Quality

#### Linting
```bash
cd frontend
npm run lint
```

#### Formatting
```bash
cd frontend
npm run format
```

## 🚀 Deployment

### Backend Deployment

1. **Build the Ballerina application**
   ```bash
   cd backend
   bal build
   ```

2. **Deploy to your server**
   - Copy the generated JAR file
   - Set environment variables
   - Run with Java

### Frontend Deployment

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to hosting service**
   - Vercel, Netlify, or any static hosting
   - Configure environment variables
   - Set up CI/CD pipeline

### Environment Setup for Production

```bash
# Backend
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
JWT_SECRET=your-prod-jwt-secret

# Frontend
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository
```bash
git clone https://github.com/your-username/medi-hunt.git
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Your Changes
- Follow the existing code style
- Add tests for new features
- Update documentation

### 4. Commit Your Changes
```bash
git commit -m 'Add amazing feature'
```

### 5. Push to the Branch
```bash
git push origin feature/amazing-feature
```

### 6. Open a Pull Request
- Provide a clear description of your changes
- Reference any related issues

### Development Guidelines

- **Code Style**: Follow TypeScript and React best practices
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new features
- **Documentation**: Update README for significant changes

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing real-time database
- **Ballerina** for the cloud-native backend framework
- **React** and **TypeScript** communities
- **shadcn/ui** for beautiful UI components

## 📞 Support

If you have any questions or need help:

- **Issues**: [GitHub Issues](https://github.com/Dulshan-Rajeewa/medi-hunt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Dulshan-Rajeewa/medi-hunt/discussions)
- **Email**: dulshanrj1@gmail.com / behanravishka03@gmail.com

---

**For better healthcare access for YOU!**
