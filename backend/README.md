# CookPad Backend API

A Node.js/Express backend API for the CookPad recipe application.

## Features

- RESTful API for recipe management
- MongoDB integration with Mongoose
- CORS enabled for frontend integration
- Input validation and error handling
- Sample data seeding

## API Endpoints

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Health Check
- `GET /` - API health check and documentation

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cookpad
NODE_ENV=development
```

3. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for automatic server restarts on file changes.

### Seeding Database
```bash
npm run seed
```
This will clear existing recipes and add sample data.

## API Usage Examples

### Get All Recipes
```bash
curl http://localhost:5000/api/recipes
```

### Create New Recipe
```bash
curl -X POST http://localhost:5000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Recipe",
    "description": "A delicious recipe",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": "Step by step instructions"
  }'
```

### Get Recipe by ID
```bash
curl http://localhost:5000/api/recipes/REPLACE_WITH_ACTUAL_ID
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:4200` (Angular dev server)
- `http://localhost:3000` (Alternative frontend port)
- `http://127.0.0.1:4200`
- `http://127.0.0.1:3000`

## Database Schema

### Recipe Model
```javascript
{
  title: String (required, max 100 chars),
  description: String (required, max 500 chars),
  ingredients: [String] (required, non-empty),
  instructions: String (required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify MongoDB is accessible on the specified port

### CORS Issues
- Ensure the frontend URL is included in the CORS origins
- Check that the frontend is running on the expected port

### Port Conflicts
- Change the PORT in `.env` if 5000 is already in use
- Update the frontend API URL accordingly
