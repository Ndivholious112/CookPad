import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-text">
          <p>© 2025 CookPad</p>
        </div>
        <div class="footer-icons">
          <i class="bi bi-egg-fried footer-icon" aria-hidden="true"></i>
          <i class="bi bi-person-workspace footer-icon" aria-hidden="true"></i>
          <i class="bi bi-basket3 footer-icon" aria-hidden="true"></i>
          <i class="bi bi-egg footer-icon" aria-hidden="true"></i>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      margin-top: 3rem;
      padding: 2rem 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-top: 1px solid rgba(45, 90, 39, 0.1);
      position: relative;
      overflow: hidden;
    }

    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #2d5a27 0%, #4a7c59 50%, #6b9b6b 100%);
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-text p {
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 500;
      margin: 0;
    }

    .footer-icons {
      display: flex;
      gap: 1rem;
    }

    .footer-icon {
      font-size: 1.5rem;
      animation: float 3s ease-in-out infinite;
      filter: drop-shadow(0 0 5px rgba(74, 124, 89, 0.3));
    }

    .footer-icon:nth-child(1) { animation-delay: 0s; }
    .footer-icon:nth-child(2) { animation-delay: 0.5s; }
    .footer-icon:nth-child(3) { animation-delay: 1s; }
    .footer-icon:nth-child(4) { animation-delay: 1.5s; }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-5px) rotate(2deg); }
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .footer-icons {
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {}
