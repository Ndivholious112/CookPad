import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
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

  constructor(private http: HttpClient) {}

  getRecipes(): Observable<Recipe[]> {
    // Try real API first, fall back to mock data
    return this.http.get<Recipe[]>(this.apiUrl).pipe(
      catchError(() => {
        console.log('Backend not available, using mock data');
        return of(this.mockRecipes).pipe(delay(500));
      })
    );
  }

  getRecipe(id: string): Observable<Recipe> {
    // Try real API first, fall back to mock data
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        console.log('Backend not available, using mock data');
        const recipe = this.mockRecipes.find(r => r.id === parseInt(id));
        if (recipe) {
          return of(recipe).pipe(delay(300));
        }
        return throwError(() => new Error('Recipe not found'));
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
}
