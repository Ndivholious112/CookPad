import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Recipe } from '../../../models/recipe.model';
import { RecipeService } from '../../../services/recipe.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.css']
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  liked = false;
  saved = false;
  likesCount = 0;
  isOwner = false;
  private likePending = false;
  private savePending = false;

  constructor(private recipeService: RecipeService, public auth: AuthService) {}

  ngOnInit() {
    const userId = this.auth.getUserId();
    const likedBy = (this.recipe as any).likedBy as string[] | undefined;
    const savedBy = (this.recipe as any).savedBy as string[] | undefined;
    this.likesCount = Array.isArray(likedBy) ? likedBy.length : 0;
    this.liked = !!(userId && likedBy && likedBy.some(u => String(u) === String(userId)));
    this.saved = !!(userId && savedBy && savedBy.some(u => String(u) === String(userId)));
    this.isOwner = !!(userId && this.recipe.createdBy && String(this.recipe.createdBy) === String(userId));
  }

  onLike(event: Event) {
    event.stopPropagation();
    if (!this.auth.isAuthenticated()) return;
    if (this.likePending) return;
    const id = this.recipe._id || String(this.recipe.id);
    if (!id) return;

    const prevLiked = this.liked;
    const prevLikes = this.likesCount;
    this.likePending = true;
    this.liked = !prevLiked;
    this.likesCount = prevLikes + (this.liked ? 1 : -1);
    this.recipeService.toggleLike(id).subscribe({
      next: (res) => {
      
        this.liked = res.liked;
        this.likesCount = res.likes;
      },
      error: () => {

        this.liked = prevLiked;
        this.likesCount = prevLikes;
      },
      complete: () => {
        this.likePending = false;
      }
    });
  }

  onSave(event: Event) {
    event.stopPropagation();
    if (!this.auth.isAuthenticated()) return;
    if (this.savePending) return;
    const id = this.recipe._id || String(this.recipe.id);
    if (!id) return;
    const prevSaved = this.saved;
    this.savePending = true;
    this.saved = !prevSaved; 
    this.recipeService.toggleSave(id).subscribe({
      next: (res) => {
        this.saved = res.saved;
      },
      error: () => {
        this.saved = prevSaved; 
      },
      complete: () => {
        this.savePending = false;
      }
    });
  }
}
