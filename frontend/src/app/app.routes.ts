import { RecipeListComponent } from './recipes/components/recipe-list/recipe-list.component';
import { RecipeFormComponent } from './recipes/components/recipe-form/recipe-form.component';
import { RecipeDetailComponent } from './recipes/components/recipe-detail/recipe-detail.component';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';

export const routes = [  
  { path: '', component: RecipeListComponent },
  { path: 'recipe/add', component: RecipeFormComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
