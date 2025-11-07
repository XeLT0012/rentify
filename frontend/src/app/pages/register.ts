import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['user'] // default role
    });
  }

  register(): void {
    if (this.form.invalid) return;

    this.http.post('http://localhost:5000/api/users/register', this.form.value)
      .subscribe({
        next: () => {
        alert('Registration successful! You can now log in.');
        this.router.navigate(['/login']);
      },
        error: err => {
          alert('Registration failed. Email may already be in use.');
          console.error('Registration failed:', err);
          // Optionally show error to user
        }
      });
  }
}
