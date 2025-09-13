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

  constructor(private recipeService: RecipeService, private router: Router) {}

  submitForm() {
    this.recipe.ingredients = this.ingredientsText.split(',').map(i => i.trim());
    this.recipeService.addRecipe(this.recipe).subscribe(() => {
      this.router.navigate(['/']); // navigate to recipe list after save
    });
  }
}
