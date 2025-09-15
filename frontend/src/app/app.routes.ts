import { RecipeListComponent } from './recipes/components/recipe-list/recipe-list.component';
import { RecipeFormComponent } from './recipes/components/recipe-form/recipe-form.component';
import { RecipeDetailComponent } from './recipes/components/recipe-detail/recipe-detail.component';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ProfileComponent } from './auth/components/profile/profile.component';

const canActivateAuth = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const routes = [  
  { path: '', component: RecipeListComponent },
  { path: 'recipe/add', component: RecipeFormComponent, canActivate: [canActivateAuth] },
  { path: 'recipe/:id/edit', component: RecipeFormComponent, canActivate: [canActivateAuth] },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [canActivateAuth] }
];
