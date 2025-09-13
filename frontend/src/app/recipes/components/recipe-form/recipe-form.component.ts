import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';
import { Recipe } from '../../../models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.css']
})
export class RecipeFormComponent {
  recipe: Recipe = { title: '', description: '', ingredients: [], instructions: '' };
  ingredientsText = '';
  loading = false;
  error: string | null = null;

  constructor(private recipeService: RecipeService, private router: Router) {}

  submitForm() {
    if (!this.recipe.title.trim()) {
      this.error = 'Recipe title is required';
      return;
    }

    this.loading = true;
    this.error = null;
    
    this.recipe.ingredients = this.ingredientsText.split(',').map(i => i.trim()).filter(i => i);
    
    this.recipeService.addRecipe(this.recipe).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Failed to save recipe. Please try again.';
        this.loading = false;
        console.error('Error saving recipe:', err);
      }
    });
  }
}
