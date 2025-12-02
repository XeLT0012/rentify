import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  forgotForm!: FormGroup;
  showForgot = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Login form with validation
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]] // ✅ enforce min length
    });

    // ✅ Forgot password form (email only)
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // ✅ Helper getters for template validation
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get forgotEmail() { return this.forgotForm.get('email'); }

  // ✅ Login
  login(): void {
    if (this.form.invalid) {
      alert('Please fix the errors before logging in.');
      return;
    }

    this.http.post<any>('http://localhost:5000/api/users/login', this.form.value)
      .subscribe({
        next: res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify({ _id: res.user._id, role: res.user.role }));
          this.auth.login(res.token, res.user.role);
          alert('Login successful!');
          this.router.navigate([res.user.role === 'admin' ? '/admin' : '/dashboard']);
        },
        error: err => {
          alert('Login failed. Please check your credentials.');
          console.error('Login failed:', err);
        }
      });
  }

  // ✅ Forgot Password → Send reset code and redirect
  sendCode(): void {
    if (this.forgotForm.invalid) {
      alert('Please enter a valid email address.');
      return;
    }

    this.http.post<any>('http://localhost:5000/api/users/forgot-password', this.forgotForm.value)
      .subscribe({
        next: res => {
          alert(res.message);
          this.router.navigate(['/reset-password'], { queryParams: { email: this.forgotForm.value.email } });
        },
        error: err => {
          alert(err.error?.error || 'Failed to send reset code.');
          console.error('Forgot password error:', err);
        }
      });
  }
}
