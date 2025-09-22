const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const recipes = await Recipe.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching my recipes:', error);
    res.status(500).json({
      error: 'Failed to fetch your recipes',
      message: error.message
    });
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function requireRecipeOwnership(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Recipe not found',
        message: 'No recipe found with the provided ID' 
      });
    }
    
    if (String(recipe.createdBy) !== String(req.user.sub)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only edit or delete your own recipes' 
      });
    }
    

    req.recipe = recipe;
    next();
  } catch (error) {
    console.error('Error checking recipe ownership:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid recipe ID',
        message: 'The provided ID is not valid' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to verify recipe ownership',
      message: error.message 
    });
  }
}


router.get('/', async (req, res) => {
  try {
    const { q, sort } = req.query;
    const hasQuery = typeof q === 'string' && q.trim().length > 0;


    let filter = {};
    if (hasQuery) {
      filter = { $text: { $search: q.trim() } };
    }


    let sortSpec = { createdAt: -1 };
    if (typeof sort === 'string') {
      switch (sort) {
        case 'oldest':
          sortSpec = { createdAt: 1 };
          break;
        case 'likes':
          sortSpec = { likesCount: -1, createdAt: -1 };
          break;
        default:
          sortSpec = { createdAt: -1 };
      }
    }

    const pipeline = [];
    if (hasQuery) {
      pipeline.push({ $match: filter });
      pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
    } else {
      pipeline.push({ $match: {} });
    }
    pipeline.push({ $addFields: { likesCount: { $size: { $ifNull: ['$likedBy', []] } } } });

    const finalSort = {};
    if (hasQuery) finalSort.score = { $meta: 'textScore' };
    Object.assign(finalSort, sortSpec);
    pipeline.push({ $sort: finalSort });

    const recipes = await Recipe.aggregate(pipeline);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recipes',
      message: error.message 
    });
  }
});

router.get('/saved/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const recipes = await Recipe.find({ savedBy: userId }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch saved recipes',
      message: error.message 
    });
  }
});

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

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, ingredients, instructions } = req.body;
    
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
    
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '';

    let createdByName = req.user?.email;
    try {
      const user = await User.findById(req.user?.sub).select('name email');
      if (user) {
        createdByName = (user.name && user.name.trim()) ? user.name.trim() : user.email;
      }
    } catch {}

    const recipe = new Recipe({
      title: title.trim(),
      description: description.trim(),
      ingredients: ingredients.map(ing => ing.trim()).filter(ing => ing),
      instructions: instructions.trim(),
      imageUrl,
      createdBy: req.user?.sub,
      createdByName
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

router.put('/:id', requireAuth, requireRecipeOwnership, upload.single('image'), async (req, res) => {
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
    if (req.file) updateData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    
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

router.delete('/:id', requireAuth, requireRecipeOwnership, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Recipe deleted successfully',
      recipe: recipe 
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    
    res.status(500).json({ 
      error: 'Failed to delete recipe',
      message: error.message 
    });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    const userId = req.user.sub;
    const idx = recipe.likedBy.findIndex(u => String(u) === String(userId));
    if (idx >= 0) {
      recipe.likedBy.splice(idx, 1);
    } else {
      recipe.likedBy.push(userId);
    }
    await recipe.save();
    res.json({ liked: idx < 0, likes: recipe.likedBy.length });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

router.post('/:id/save', requireAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    const userId = req.user.sub;
    const idx = recipe.savedBy.findIndex(u => String(u) === String(userId));
    if (idx >= 0) {
      recipe.savedBy.splice(idx, 1);
    } else {
      recipe.savedBy.push(userId);
    }
    await recipe.save();
    res.json({ saved: idx < 0, saves: recipe.savedBy.length });
  } catch (error) {
    console.error('Error toggling save:', error);
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

module.exports = router;
