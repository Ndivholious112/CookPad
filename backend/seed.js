const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
require('dotenv').config();

const sampleRecipes = [
  {
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade chocolate chip cookies that are soft and chewy.',
    ingredients: [
      '2 cups all-purpose flour',
      '1/2 tsp baking soda',
      '1/2 tsp salt',
      '3/4 cup butter, softened',
      '1 cup brown sugar',
      '1/2 cup white sugar',
      '2 eggs',
      '2 tsp vanilla extract',
      '2 cups chocolate chips'
    ],
    instructions: '1. Preheat oven to 375°F (190°C). 2. Mix dry ingredients in a bowl. 3. Cream butter and sugars until fluffy. 4. Add eggs and vanilla. 5. Combine wet and dry ingredients. 6. Fold in chocolate chips. 7. Drop rounded tablespoons onto ungreased cookie sheets. 8. Bake 9-11 minutes until golden brown.'
  },
  {
    title: 'Spaghetti Carbonara',
    description: 'Creamy Italian pasta dish with eggs, cheese, and pancetta.',
    ingredients: [
      '1 lb spaghetti',
      '6 oz pancetta, diced',
      '4 large eggs',
      '1 cup grated Parmesan cheese',
      '4 cloves garlic, minced',
      'Black pepper, to taste',
      'Salt, to taste',
      '2 tbsp olive oil'
    ],
    instructions: '1. Cook spaghetti according to package directions. 2. Cook pancetta until crispy. 3. Whisk eggs with Parmesan and pepper. 4. Toss hot pasta with pancetta and garlic. 5. Remove from heat and quickly toss with egg mixture. 6. Serve immediately with extra Parmesan.'
  },
  {
    title: 'Chicken Stir Fry',
    description: 'Quick and healthy chicken stir fry with vegetables.',
    ingredients: [
      '1 lb chicken breast, sliced',
      '2 bell peppers, sliced',
      '1 onion, sliced',
      '2 cloves garlic, minced',
      '1 tbsp ginger, grated',
      '3 tbsp soy sauce',
      '2 tbsp vegetable oil',
      '1 tsp sesame oil',
      'Green onions for garnish'
    ],
    instructions: '1. Heat oil in a large wok or pan. 2. Cook chicken until golden brown. 3. Add garlic and ginger, cook for 1 minute. 4. Add vegetables and stir fry for 3-4 minutes. 5. Add soy sauce and sesame oil. 6. Garnish with green onions and serve over rice.'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cookpad';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('🗑️  Cleared existing recipes');
    
    // Insert sample recipes
    const recipes = await Recipe.insertMany(sampleRecipes);
    console.log(`🌱 Seeded ${recipes.length} recipes`);
    
    // Display seeded recipes
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.title}`);
    });
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();
