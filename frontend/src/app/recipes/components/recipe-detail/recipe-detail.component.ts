import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RecipeService } from '../../../services/recipe.service';
import { Recipe } from '../../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe?: Recipe;
  loading = true;
  error: string | null = null;
  recipeId: string | null = null;

  constructor(private route: ActivatedRoute, private recipeService: RecipeService, private router: Router, public auth: AuthService) {}

  ngOnInit() {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    if (!this.recipeId) {
      this.error = 'Recipe ID not found';
      this.loading = false;
      return;
    }

    this.loadRecipe(this.recipeId);
  }

  loadRecipe(id: string) {
    this.loading = true;
    this.error = null;
    
    this.recipeService.getRecipe(id).subscribe({
      next: (data) => {
        this.recipe = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load recipe. Please try again later.';
        this.loading = false;
        console.error('Error loading recipe:', err);
      }
    });
  }

  get instructionSteps(): string[] {
    const text = this.recipe?.instructions || '';
    return text
      .split(/\r?\n+|\d+\.|\s*\d+\)\s*|\s*\-\s*|\s*\;\s*/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  onDelete() {
    if (!this.recipe) return;
    const id = (this.recipe as any)._id || String(this.recipe.id);
    if (!id) return;
    this.loading = true;
    this.recipeService.deleteRecipe(id).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.loading = false;
        this.error = 'Failed to delete recipe.';
      }
    });
  }
}
