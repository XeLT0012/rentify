import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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

  // ✅ Secret code for admin registration
  private readonly ADMIN_SECRET = 'ADMIN';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], // ✅ enforce min length
      role: ['user', Validators.required],
      adminCode: [''] // only required if role = admin
    });

    // ✅ Watch role changes → require adminCode if role = admin
    this.form.get('role')?.valueChanges.subscribe(role => {
      const adminCodeControl = this.form.get('adminCode');
      if (role === 'admin') {
        adminCodeControl?.setValidators([Validators.required, this.adminCodeValidator.bind(this)]);
      } else {
        adminCodeControl?.clearValidators();
      }
      adminCodeControl?.updateValueAndValidity();
    });
  }

  // ✅ Custom validator for admin code
  adminCodeValidator(control: AbstractControl) {
    return control.value === this.ADMIN_SECRET ? null : { invalidCode: true };
  }

  // Helper getters for template validation
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get adminCode() { return this.form.get('adminCode'); }

  register(): void {
    if (this.form.invalid) {
      alert('Please fix the errors before submitting.');
      return;
    }

    this.http.post('http://localhost:5000/api/users/register', this.form.value)
      .subscribe({
        next: () => {
          alert('Registration successful! You can now log in.');
          this.router.navigate(['/login']);
        },
        error: err => {
          alert('Registration failed. Email may already be in use.');
          console.error('Registration failed:', err);
        }
      });
  }
}
