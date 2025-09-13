import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  submitForm() {
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.router.navigate(['/']);
        } else {
          this.error = 'Invalid email or password';
        }
      },
      error: (err) => {
        this.error = 'Login failed. Please try again.';
        this.loading = false;
        console.error('Login error:', err);
      }
    });
  }
}
