import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <i class="bi bi-egg-fried logo-icon" aria-hidden="true"></i>
          <h1>CookPad</h1>
        </div>
        <button class="menu-toggle" (click)="toggleMenu()" aria-label="Toggle navigation">
          <i class="bi" [ngClass]="{ 'bi-list': !menuOpen, 'bi-x': menuOpen }" aria-hidden="true"></i>
        </button>
        <nav class="nav" [class.open]="menuOpen">
          <a routerLink="/" class="nav-link">
            <i class="bi bi-house nav-icon" aria-hidden="true"></i>
            <span>Home</span>
          </a>
          <a routerLink="/recipe/add" class="nav-link">
            <i class="bi bi-plus-circle nav-icon" aria-hidden="true"></i>
            <span>Add Recipe</span>
          </a>
          <ng-container *ngIf="auth.isAuthenticated(); else guestLinks">
            <a routerLink="/profile" class="nav-link">
              <i class="bi bi-person-circle nav-icon" aria-hidden="true"></i>
              <span>Profile</span>
            </a>
            <a href="#" class="nav-link" (click)="onLogout($event)">
              <i class="bi bi-box-arrow-right nav-icon" aria-hidden="true"></i>
              <span>Logout</span>
            </a>
          </ng-container>
          <ng-template #guestLinks>
            <a routerLink="/login" class="nav-link">
              <i class="bi bi-key nav-icon" aria-hidden="true"></i>
              <span>Login</span>
            </a>
            <a routerLink="/register" class="nav-link">
              <i class="bi bi-pencil-square nav-icon" aria-hidden="true"></i>
              <span>Register</span>
            </a>
          </ng-template>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(45, 90, 39, 0.1);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(45, 90, 39, 0.1);
    }
    
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .logo-icon {
      font-size: 2rem;
      animation: bounce 2s ease-in-out infinite;
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
    
    .logo h1 {
      color: #1e3a1a;
      font-family: 'Inter', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
    }
    
    .nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #4a7c59;
      text-decoration: none;
      font-weight: 500;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      background: rgba(74, 124, 89, 0.1);
      border: 1px solid rgba(74, 124, 89, 0.2);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .nav-link:hover::before {
      left: 100%;
    }
    
    .nav-link:hover {
      background: rgba(74, 124, 89, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(74, 124, 89, 0.2);
      color: #2d5a27;
    }
    
    .nav-icon {
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }
    
    .nav-link:hover .nav-icon {
      transform: scale(1.2) rotate(5deg);
    }
    
    .nav-link span:last-child {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .menu-toggle {
      display: none;
      background: transparent;
      border: none;
      font-size: 1.75rem;
      color: #2d5a27;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .menu-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .nav {
        position: absolute;
        top: 64px;
        right: 16px;
        left: 16px;
        flex-direction: column;
        gap: 0.75rem;
        background: #ffffff;
        border: 1px solid rgba(74, 124, 89, 0.2);
        border-radius: 10px;
        padding: 0.75rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        display: none;
        z-index: 1100;
      }
      .nav.open {
        display: flex;
      }
    }
  `]
})
export class HeaderComponent {
  menuOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  onLogout(event: Event) {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
