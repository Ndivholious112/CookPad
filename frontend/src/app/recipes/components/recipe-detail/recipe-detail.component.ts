import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RecipeService } from '../../../services/recipe.service';
import { Recipe } from '../../../models/recipe.model';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

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
  private sub?: Subscription;
 
  baseServings = 1;
  servings = 1;
  private originalIngredients: string[] = [];

  constructor(private route: ActivatedRoute, private recipeService: RecipeService, private router: Router, public auth: AuthService) {}

  ngOnInit() {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    if (!this.recipeId) {
      this.error = 'Recipe ID not found';
      this.loading = false;
      return;
    }

    const navState: any = (history && (history.state || {})) || {};
    const stateRecipe: Recipe | undefined = navState.recipe;
    if (stateRecipe && ((stateRecipe as any)._id || (stateRecipe as any).id)) {
      const stateId = (stateRecipe as any)._id || String((stateRecipe as any).id);
      if (String(stateId) === String(this.recipeId)) {
        this.recipe = stateRecipe;
        this.loading = false; 
        this.loadRecipe(this.recipeId, true);
        return;
      }
    }

    this.loadRecipe(this.recipeId);
  }

  loadRecipe(id: string, silent = false) {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    if (!silent) this.loading = true;
    this.error = null;
    this.sub = this.recipeService.getRecipe(id).pipe(
      finalize(() => {
        if (!silent) this.loading = false;
      })
    ).subscribe({
      next: (data) => {
        this.recipe = data;
       
        this.baseServings = (this.recipe as any).servings && Number((this.recipe as any).servings) > 0 ? Number((this.recipe as any).servings) : 1;
        this.servings = this.baseServings;
        this.originalIngredients = Array.isArray(this.recipe?.ingredients) ? [...(this.recipe!.ingredients as string[])] : [];
      },
      error: (err) => {
        if (!silent) this.error = 'Failed to load recipe. Please try again later.';
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
    this.recipeService.deleteRecipe(id).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        if (err.status === 403) {
          this.error = 'You can only delete your own recipes.';
        } else {
          this.error = 'Failed to delete recipe.';
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  isOwner(): boolean {
    if (!this.recipe || !this.auth.isAuthenticated()) return false;
    const currentUserId = this.auth.getUserId();
    return currentUserId === this.recipe.createdBy;
  }

  decreaseServings() {
    if (this.servings <= 1) return;
    this.servings--;
  }

  increaseServings() {
    if (this.servings >= 20) return; 
    this.servings++;
  }

  get scaledIngredients(): string[] {
    if (!this.originalIngredients || this.originalIngredients.length === 0) return [];
    const factor = this.baseServings > 0 ? this.servings / this.baseServings : 1;
    return this.originalIngredients.map(line => this.scaleLine(line, factor));
  }

  private scaleLine(line: string, factor: number): string {

    const mixedRe = /^(\s*)(\d+)\s+(\d+)\/(\d+)(.*)$/; 
    const fracRe = /^(\s*)(\d+)\/(\d+)(.*)$/;           
    const numRe = /^(\s*)(\d+(?:\.\d+)?)(.*)$/;         

    const toFractionText = (value: number): string => {
  
      const eighths = Math.round(value * 8);
      const whole = Math.trunc(eighths / 8);
      const rem = Math.abs(eighths % 8);
      const fracMap: Record<number, string> = { 0: '', 1: '1/8', 2: '1/4', 3: '3/8', 4: '1/2', 5: '5/8', 6: '3/4', 7: '7/8' };
      const frac = fracMap[rem];
      if (whole === 0) return frac || '0';
      return frac ? `${whole} ${frac}` : `${whole}`;
    };

    let m = line.match(mixedRe);
    if (m) {
      const whole = parseFloat(m[2]);
      const num = parseFloat(m[3]);
      const den = parseFloat(m[4]);
      const base = whole + num / den;
      const scaled = base * factor;
      const rest = m[5];
      return `${m[1]}${toFractionText(scaled)}${rest}`.trim();
    }
    m = line.match(fracRe);
    if (m) {
      const num = parseFloat(m[2]);
      const den = parseFloat(m[3]);
      const scaled = (num / den) * factor;
      const rest = m[4];
      return `${m[1]}${toFractionText(scaled)}${rest}`.trim();
    }
    m = line.match(numRe);
    if (m) {
      const n = parseFloat(m[2]);
      if (!isNaN(n)) {
        const scaled = n * factor;
        const rest = m[3];
        return `${m[1]}${toFractionText(scaled)}${rest}`.trim();
      }
    }
    return line; 
  }

  onPrint() {
    window.print();
  }

  onCopyLink() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }
}
