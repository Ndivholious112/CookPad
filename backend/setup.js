const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envContent = `PORT=5000
MONGO_URI=mongodb://localhost:27017/cookpad
NODE_ENV=development
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('🔧 Backend setup completed!');
console.log('📝 Make sure MongoDB is running before starting the server');
console.log('🚀 Run "npm start" to start the backend server');
console.log('🌱 Run "npm run seed" to populate the database with sample data');
