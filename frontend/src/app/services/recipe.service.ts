import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, map, switchMap, timeout } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private apiUrl = 'http://localhost:5050/api/recipes';
  private recipesCache: Recipe[] | null = null;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  getRecipes(opts?: { q?: string; sort?: 'newest' | 'oldest' | 'likes' }): Observable<Recipe[]> {
    const useCache = !opts || (!opts.q && !opts.sort);
    if (useCache && this.recipesCache) {
      return of(this.recipesCache);
    }
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.sort) params = params.set('sort', opts.sort);
    return this.http.get<Recipe[]>(this.apiUrl, { params }).pipe(
      timeout(15000),
      map(list => list.map(r => this.withNormalizedImage(r))),
      map(list => {
        if (useCache) this.recipesCache = list;
        return list;
      })
    );
  }

  getRecipe(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`).pipe(
      timeout(15000),
      map(r => this.withNormalizedImage(r)),
      catchError((err) => {
        if (this.recipesCache) {
          const hit = this.recipesCache.find(r => (r as any)._id === id || (r.id !== undefined && String(r.id) === String(id)));
          if (hit) return of(hit);
        }
        return throwError(() => err);
      })
    );
  }

  addRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  addRecipeFormData(formData: FormData): Observable<Recipe> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<Recipe>(this.apiUrl, formData, { headers }).pipe(
      timeout(15000),
      map(r => this.withNormalizedImage(r))
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
      timeout(15000),
      map(r => this.withNormalizedImage(r))
    );
  }

  deleteRecipe(id: string): Observable<void> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(timeout(15000));
  }

  toggleLike(id: string): Observable<{ liked: boolean; likes: number }> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<{ liked: boolean; likes: number }>(`${this.apiUrl}/${id}/like`, {}, { headers }).pipe(timeout(15000));
  }

  toggleSave(id: string): Observable<{ saved: boolean; saves: number }> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<{ saved: boolean; saves: number }>(`${this.apiUrl}/${id}/save`, {}, { headers }).pipe(timeout(15000));
  }

  getSavedRecipes(): Observable<Recipe[]> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<Recipe[]>(`${this.apiUrl}/saved/me`, { headers }).pipe(
      timeout(15000),
      map(list => list.map(r => this.withNormalizedImage(r)))
    );
  }

  getMyRecipes(): Observable<Recipe[]> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<Recipe[]>(`${this.apiUrl}/mine`, { headers }).pipe(
      timeout(15000),
      map(list => list.map(r => this.withNormalizedImage(r)))
    );
  }

  private withNormalizedImage(recipe: Recipe): Recipe {
    if (!recipe || !recipe.imageUrl) return recipe;
    try {
      const url = new URL(recipe.imageUrl, 'http://localhost:5050');
      if (url.hostname === 'localhost' && (url.port === '5000' || url.port === '')) {
        url.port = '5050';
      }
      return { ...recipe, imageUrl: url.toString() };
    } catch {
      // If it's a relative path like /uploads/..., ensure it points to backend
      if (recipe.imageUrl.startsWith('/uploads')) {
        return { ...recipe, imageUrl: `http://localhost:5050${recipe.imageUrl}` };
      }
      return recipe;
    }
  }
}
