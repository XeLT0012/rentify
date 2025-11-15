import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth'; // Adjust path if needed

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // ✅ Removed HttpClientModule
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {
  if (this.form.invalid) return;

  this.http.post<any>('http://localhost:5000/api/users/login', this.form.value)
    .subscribe({
      next: res => {
        // ✅ Save only token, userId, and role
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify({
          _id: res.user._id,
          role: res.user.role
        }));

        // ✅ Use role for redirect
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

}
