import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, map, tap } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private apiUrl = 'http://localhost:5000/api/recipes';
  private mockRecipes: Recipe[] = [
    {
      id: 1,
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies that are soft and chewy.',
      ingredients: ['2 cups all-purpose flour', '1/2 tsp baking soda', '1/2 tsp salt', '3/4 cup butter', '1 cup brown sugar', '1/2 cup white sugar', '2 eggs', '2 tsp vanilla extract', '2 cups chocolate chips'],
      instructions: '1. Preheat oven to 375°F. 2. Mix dry ingredients in a bowl. 3. Cream butter and sugars. 4. Add eggs and vanilla. 5. Combine wet and dry ingredients. 6. Fold in chocolate chips. 7. Drop rounded tablespoons onto ungreased cookie sheets. 8. Bake 9-11 minutes until golden brown.'
    },
    {
      id: 2,
      title: 'Spaghetti Carbonara',
      description: 'Creamy Italian pasta dish with eggs, cheese, and pancetta.',
      ingredients: ['1 lb spaghetti', '6 oz pancetta', '4 large eggs', '1 cup grated Parmesan cheese', '4 cloves garlic', 'Black pepper', 'Salt'],
      instructions: '1. Cook spaghetti according to package directions. 2. Cook pancetta until crispy. 3. Whisk eggs with Parmesan and pepper. 4. Toss hot pasta with pancetta. 5. Remove from heat and quickly toss with egg mixture. 6. Serve immediately with extra Parmesan.'
    }
  ];
  private nextId = 3;

  private recipesCache: Recipe[] | null = null;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  getRecipes(forceRefresh = false): Observable<Recipe[]> {
    if (!forceRefresh && this.recipesCache) {
      return of(this.recipesCache);
    }
    return this.http.get<Recipe[]>(this.apiUrl).pipe(
      tap(list => this.recipesCache = list),
      catchError(() => {
        console.log('Backend not available, using mock data');
        this.recipesCache = this.mockRecipes;
        return of(this.mockRecipes).pipe(delay(100));
      })
    );
  }

  getRecipe(id: string): Observable<Recipe> {
    // Try real API first, fall back to mock data
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        // Fallback: search in mock or in fetched list
        const mockHit = this.mockRecipes.find(r => r.id === parseInt(id));
        if (mockHit) {
          return of(mockHit).pipe(delay(100));
        }
        return this.getRecipes().pipe(
          map(list => {
            const hit = list.find(r => (r as any)._id === id || (r.id !== undefined && String(r.id) === String(id)));
            if (!hit) {
              throw new Error('Recipe not found');
            }
            return hit;
          })
        );
      })
    );
  }

  addRecipe(recipe: Recipe): Observable<Recipe> {
    // Try real API first, fall back to mock data
    return this.http.post<Recipe>(this.apiUrl, recipe).pipe(
      catchError(() => {
        console.log('Backend not available, using mock data');
        const newRecipe = { ...recipe, id: this.nextId++ };
        this.mockRecipes.push(newRecipe);
        return of(newRecipe).pipe(delay(500));
      })
    );
  }

  addRecipeFormData(formData: FormData): Observable<Recipe> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<Recipe>(this.apiUrl, formData, { headers }).pipe(
      tap(() => this.invalidateRecipesCache()),
      catchError(() => {
        console.log('Backend not available, using mock data');
        const fallback: Recipe = {
          id: this.nextId++,
          title: formData.get('title') as string,
          description: (formData.get('description') as string) || '',
          ingredients: (formData.getAll('ingredients') as string[]) || [],
          instructions: (formData.get('instructions') as string) || '',
          imageUrl: ''
        };
        this.mockRecipes.push(fallback);
        this.invalidateRecipesCache();
        return of(fallback).pipe(delay(100));
      })
    );
  }

  // Helper to build FormData with an optional image file
  createRecipeFormData(recipe: Recipe, file?: File): FormData {
    const formData = new FormData();
    formData.append('title', recipe.title);
    formData.append('description', recipe.description || '');
    (recipe.ingredients || []).forEach(i => formData.append('ingredients', i));
    formData.append('instructions', recipe.instructions || '');
    if (file) {
      formData.append('image', file);
    }
    return formData;
  }

  updateRecipeFormData(id: string, formData: FormData): Observable<Recipe> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, formData, { headers }).pipe(
      tap(() => this.invalidateRecipesCache()),
      catchError(() => {
        // Fallback: update mock
        const idx = this.mockRecipes.findIndex(r => String(r.id) === String(id));
        if (idx >= 0) {
          const updated = { ...this.mockRecipes[idx] };
          this.mockRecipes[idx] = updated;
          this.invalidateRecipesCache();
          return of(updated).pipe(delay(100));
        }
        return throwError(() => new Error('Update failed'));
      })
    );
  }

  deleteRecipe(id: string): Observable<void> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => this.invalidateRecipesCache()),
      catchError(() => {
        const idx = this.mockRecipes.findIndex(r => String(r.id) === String(id));
        if (idx >= 0) {
          this.mockRecipes.splice(idx, 1);
          this.invalidateRecipesCache();
          return of(void 0).pipe(delay(100));
        }
        return throwError(() => new Error('Delete failed'));
      })
    );
  }

  private invalidateRecipesCache() {
    this.recipesCache = null;
  }

  toggleLike(id: string): Observable<{ liked: boolean; likes: number }> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<{ liked: boolean; likes: number }>(`${this.apiUrl}/${id}/like`, {}, { headers });
  }

  toggleSave(id: string): Observable<{ saved: boolean; saves: number }> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<{ saved: boolean; saves: number }>(`${this.apiUrl}/${id}/save`, {}, { headers });
  }

  getSavedRecipes(): Observable<Recipe[]> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<Recipe[]>(`${this.apiUrl}/saved/me`, { headers });
  }
}
