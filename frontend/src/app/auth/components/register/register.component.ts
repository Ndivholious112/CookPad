import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] 
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  submitForm() {
    if (!this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.register(this.email, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Email already exists. Please use a different email.';
        }
      },
      error: (err) => {
        this.error = 'Registration failed. Please try again.';
        this.loading = false;
        console.error('Registration error:', err);
      }
    });
  }
}
