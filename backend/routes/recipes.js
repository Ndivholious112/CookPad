const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// GET /api/recipes - Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recipes',
      message: error.message 
    });
  }
});

// GET /api/recipes/:id - Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Recipe not found',
        message: 'No recipe found with the provided ID' 
      });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid recipe ID',
        message: 'The provided ID is not valid' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch recipe',
      message: error.message 
    });
  }
});

// POST /api/recipes - Create new recipe
router.post('/', async (req, res) => {
  try {
    const { title, description, ingredients, instructions } = req.body;
    
    // Validation
    if (!title || !description || !ingredients || !instructions) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, description, ingredients, and instructions are required'
      });
    }
    
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        error: 'Invalid ingredients',
        message: 'Ingredients must be a non-empty array'
      });
    }
    
    const recipe = new Recipe({
      title: title.trim(),
      description: description.trim(),
      ingredients: ingredients.map(ing => ing.trim()).filter(ing => ing),
      instructions: instructions.trim()
    });
    
    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create recipe',
      message: error.message 
    });
  }
});

// PUT /api/recipes/:id - Update recipe
router.put('/:id', async (req, res) => {
  try {
    const { title, description, ingredients, instructions } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (ingredients) {
      if (!Array.isArray(ingredients)) {
        return res.status(400).json({
          error: 'Invalid ingredients',
          message: 'Ingredients must be an array'
        });
      }
      updateData.ingredients = ingredients.map(ing => ing.trim()).filter(ing => ing);
    }
    if (instructions) updateData.instructions = instructions.trim();
    
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Recipe not found',
        message: 'No recipe found with the provided ID' 
      });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid recipe ID',
        message: 'The provided ID is not valid' 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update recipe',
      message: error.message 
    });
  }
});

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Recipe not found',
        message: 'No recipe found with the provided ID' 
      });
    }
    
    res.json({ 
      message: 'Recipe deleted successfully',
      recipe: recipe 
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid recipe ID',
        message: 'The provided ID is not valid' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to delete recipe',
      message: error.message 
    });
  }
});

module.exports = router;
