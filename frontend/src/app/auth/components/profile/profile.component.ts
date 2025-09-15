import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RecipeService } from '../../../services/recipe.service';
import { RecipeCardComponent } from '../../../recipes/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RecipeCardComponent],
  template: `
    <section class="profile">
      <h2>Your Profile</h2>
      <p>Email: {{ email || 'Unknown' }}</p>
      <form (ngSubmit)="onSave()" style="display:flex; flex-direction:column; gap:8px; max-width:480px;">
        <label for="name">Name</label>
        <input id="name" [(ngModel)]="name" name="name" placeholder="Your name">
        <label for="bio">About you</label>
        <textarea id="bio" [(ngModel)]="bio" name="bio" rows="4" placeholder="Tell us about yourself"></textarea>
        <div style="display:flex; gap:8px; margin-top:4px;">
          <button type="submit" class="btn-outline" [disabled]="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          <button type="button" class="btn-outline" (click)="onLogout()">Logout</button>
        </div>
        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="success" class="success">Profile updated.</div>
      </form>

      <div style="margin-top: 2rem;">
        <h3>Saved Recipes</h3>
        <div *ngIf="savedLoading" class="loading"><p>Loading saved...</p></div>
        <div *ngIf="savedError" class="error"><p>{{ savedError }}</p></div>
        <div *ngIf="!savedLoading && !savedError">
          <div *ngIf="savedRecipes.length === 0" class="no-recipes"><p>No saved recipes yet.</p></div>
          <app-recipe-card *ngFor="let r of savedRecipes" [recipe]="r"></app-recipe-card>
        </div>
      </div>
    </section>
  `
})
export class ProfileComponent {
  email: string | null = null;
  name = '';
  bio = '';
  saving = false;
  error: string | null = null;
  success = false;
  savedRecipes: any[] = [];
  savedLoading = false;
  savedError: string | null = null;

  constructor(private auth: AuthService, private router: Router, private recipeService: RecipeService) {
    // For simplicity, decode email from token if present
    this.auth.getProfile().subscribe({
      next: (p) => {
        this.email = p.email;
        this.name = p.name || '';
        this.bio = p.bio || '';
      },
      error: () => {
        // ignore, show defaults
      }
    });
    this.loadSaved();
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  onSave() {
    this.saving = true;
    this.error = null;
    this.success = false;
    this.auth.updateProfile({ name: this.name, bio: this.bio }).subscribe({
      next: (p) => {
        this.name = p.name || '';
        this.bio = p.bio || '';
        this.saving = false;
        this.success = true;
      },
      error: () => {
        this.saving = false;
        this.error = 'Failed to update profile.';
      }
    });
  }

  loadSaved() {
    this.savedLoading = true;
    this.savedError = null;
    this.recipeService.getSavedRecipes().subscribe({
      next: (list) => {
        this.savedRecipes = list;
        this.savedLoading = false;
      },
      error: () => {
        this.savedError = 'Failed to load saved recipes';
        this.savedLoading = false;
      }
    });
  }
}


