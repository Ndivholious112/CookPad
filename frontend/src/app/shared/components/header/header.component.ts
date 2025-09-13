import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="header">
      <h1>CookPad</h1>
      <nav>
        <a routerLink="/">Home</a>
        <a routerLink="/add">Add Recipe</a>
        <a routerLink="/login">Login</a>
        <a routerLink="/register">Register</a>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #007bff;
      color: white;
      padding: 1rem;
      border-radius: 0 0 10px 10px;
    }
    nav a {
      color: white;
      margin-left: 1rem;
      text-decoration: none;
      font-weight: 500;
    }
    nav a:hover {
      text-decoration: underline;
    }
  `]
})
export class HeaderComponent {}
