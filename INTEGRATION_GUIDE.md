# CookPad Backend-Frontend Integration Guide

This guide will help you set up and run the complete CookPad application with both backend and frontend connected.

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment (creates .env file)
npm run setup

# Start MongoDB (if running locally)
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod

# Seed database with sample data
npm run seed

# Start backend server
npm start
```

The backend will be running at `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm start
```

The frontend will be running at `http://localhost:4200`

## 🔧 Configuration

### Backend Configuration

The backend is configured to:
- Run on port 5000
- Connect to MongoDB at `mongodb://localhost:27017/cookpad`
- Accept CORS requests from `http://localhost:4200`
- Provide RESTful API endpoints for recipes

### Frontend Configuration

The frontend is configured to:
- Run on port 4200
- Connect to backend API at `http://localhost:5000/api/recipes`
- Fall back to mock data if backend is unavailable
- Use professional green design theme

## 📡 API Endpoints

### Recipes API (`http://localhost:5000/api/recipes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | Get all recipes |
| GET | `/api/recipes/:id` | Get recipe by ID |
| POST | `/api/recipes` | Create new recipe |
| PUT | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe |

### Health Check
- GET `/` - API status and documentation

## 🗄️ Database Schema

### Recipe Model
```javascript
{
  _id: ObjectId,
  title: String (required, max 100 chars),
  description: String (required, max 500 chars),
  ingredients: [String] (required, non-empty),
  instructions: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the Integration

### 1. Test Backend API
```bash
# Test health endpoint
curl http://localhost:5000/

# Test recipes endpoint
curl http://localhost:5000/api/recipes

# Create a new recipe
curl -X POST http://localhost:5000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Recipe",
    "description": "A test recipe",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": "Test instructions"
  }'
```

### 2. Test Frontend
1. Open `http://localhost:4200` in your browser
2. You should see the recipe list with sample data
3. Try adding a new recipe
4. Click on a recipe to view details
5. Test the login/register functionality

## 🔍 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
MongoDB connection error: connect ECONNREFUSED ::1:27017
```
**Solution:** Start MongoDB service or use a cloud MongoDB instance

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` file or kill the process using port 5000

### Frontend Issues

**CORS Error:**
```
Access to fetch at 'http://localhost:5000/api/recipes' from origin 'http://localhost:4200' has been blocked by CORS policy
```
**Solution:** Ensure backend is running and CORS is properly configured

**API Connection Error:**
```
Http failure response for http://localhost:5000/api/recipes: 0 Unknown Error
```
**Solution:** Check if backend is running on port 5000

### Integration Issues

**Frontend shows "Backend not available, using mock data":**
- This is normal if backend is not running
- Start the backend server to use real data
- The frontend will automatically switch to real API when available

## 📁 Project Structure

```
CookPad/
├── backend/
│   ├── models/
│   │   └── Recipe.js
│   ├── routes/
│   │   └── recipes.js
│   ├── server.js
│   ├── seed.js
│   ├── setup.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/
│   │   │   │   └── recipe.service.ts
│   │   │   ├── models/
│   │   │   │   └── recipe.model.ts
│   │   │   └── ...
│   │   └── ...
│   └── package.json
└── README.md
```

## 🎯 Features

### Backend Features
- ✅ RESTful API for recipe management
- ✅ MongoDB integration with Mongoose
- ✅ Input validation and error handling
- ✅ CORS configuration for frontend
- ✅ Sample data seeding
- ✅ Professional error responses

### Frontend Features
- ✅ Professional green design theme
- ✅ Recipe listing and management
- ✅ Add new recipes
- ✅ View recipe details
- ✅ User authentication (mock)
- ✅ Responsive design
- ✅ Error handling and loading states
- ✅ Fallback to mock data

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (local or cloud)
2. Update `MONGO_URI` in `.env`
3. Deploy to your preferred platform (Heroku, AWS, etc.)
4. Update frontend API URL to production backend URL

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to your preferred platform (Netlify, Vercel, etc.)
3. Update API URL in `recipe.service.ts` if needed

## 📞 Support

If you encounter any issues:
1. Check the console logs for both backend and frontend
2. Verify MongoDB is running
3. Ensure both servers are running on correct ports
4. Check CORS configuration
5. Review the API endpoints and data format

The application is designed to work seamlessly with both backend and frontend running, and gracefully fall back to mock data when the backend is unavailable.
