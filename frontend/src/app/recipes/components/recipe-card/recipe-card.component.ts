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

  constructor(private recipeService: RecipeService, public auth: AuthService) {}

  ngOnInit() {
    const userId = this.auth.getUserId();
    const likedBy = (this.recipe as any).likedBy as string[] | undefined;
    const savedBy = (this.recipe as any).savedBy as string[] | undefined;
    this.likesCount = Array.isArray(likedBy) ? likedBy.length : 0;
    this.liked = !!(userId && likedBy && likedBy.some(u => String(u) === String(userId)));
    this.saved = !!(userId && savedBy && savedBy.some(u => String(u) === String(userId)));
  }

  onLike(event: Event) {
    event.stopPropagation();
    if (!this.auth.isAuthenticated()) return;
    const id = this.recipe._id || String(this.recipe.id);
    if (!id) return;
    this.recipeService.toggleLike(id).subscribe(res => {
      this.liked = res.liked;
      this.likesCount = res.likes;
    });
  }

  onSave(event: Event) {
    event.stopPropagation();
    if (!this.auth.isAuthenticated()) return;
    const id = this.recipe._id || String(this.recipe.id);
    if (!id) return;
    this.recipeService.toggleSave(id).subscribe(res => {
      this.saved = res.saved;
    });
  }
}
