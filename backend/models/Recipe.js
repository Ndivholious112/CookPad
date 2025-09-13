const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  ingredients: [{
    type: String,
    required: true,
    trim: true
  }],
  instructions: {
    type: String,
    required: [true, 'Recipe instructions are required'],
    trim: true
  }
}, {
  timestamps: true
});

// Add indexes for better performance
recipeSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
