import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <p>© 2025 Recipe Book. Built with Angular 19.</p>
    </footer>
  `,
  styles: [`
    .footer {
      text-align: center;
      margin-top: 2rem;
      padding: 1rem;
      background: #f1f1f1;
      border-radius: 10px;
    }
  `]
})
export class FooterComponent {}
