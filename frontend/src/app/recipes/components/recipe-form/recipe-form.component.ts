import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';
import { Recipe } from '../../../models/recipe.model';
import { AuthService } from '../../../services/auth.service';

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
  selectedFile?: File;
  imagePreviewUrl?: string;
  editMode = false;
  recipeId?: string;

  constructor(private recipeService: RecipeService, private router: Router, private route: ActivatedRoute, private auth: AuthService) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.recipeId = id;
      this.loading = true;
      this.recipeService.getRecipe(id).subscribe({
        next: (data) => {
          this.recipe = data;
          this.ingredientsText = (data.ingredients || []).join(', ');
          this.imagePreviewUrl = data.imageUrl;
          // Enforce owner-only editing on the client as well
          const currentUserId = this.auth.getUserId();
          if (!currentUserId || currentUserId !== this.recipe.createdBy) {
            this.error = 'You can only edit your own recipes.';
            this.loading = false;
            // optionally navigate away after a short delay
            setTimeout(() => this.router.navigate(['/recipe', id]), 1000);
            return;
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load recipe for editing.';
          this.loading = false;
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  submitForm() {
    if (!this.recipe.title.trim()) {
      this.error = 'Recipe title is required';
      return;
    }

    this.loading = true;
    this.error = null;
    
    this.recipe.ingredients = this.ingredientsText.split(',').map(i => i.trim()).filter(i => i);
    const formData = this.recipeService.createRecipeFormData(this.recipe, this.selectedFile);

    const obs = this.editMode && this.recipeId
      ? this.recipeService.updateRecipeFormData(this.recipeId, formData)
      : this.recipeService.addRecipeFormData(formData);

    obs.subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err?.status === 403) {
          this.error = 'You can only update your own recipes.';
        } else {
          this.error = 'Failed to save recipe. Please try again.';
        }
        this.loading = false;
        console.error('Error saving recipe:', err);
      }
    });
  }
}
