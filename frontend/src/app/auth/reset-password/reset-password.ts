import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  email!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('ResetPasswordComponent init');
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    this.form = this.fb.group({
      code: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    }, { validators: this.matchPasswords });
  }

  matchPasswords(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  resetPassword(): void {
    console.log('Reset password clicked'); // ✅ debug log
    if (this.form.invalid) return;

    const payload = {
      email: this.email,
      code: this.form.value.code,
      password: this.form.value.password
    };

    this.http.post<any>('http://localhost:5000/api/users/reset-password', payload)
      .subscribe({
        next: res => {
          alert(res.message);
          this.router.navigate(['/login']);
        },
        error: err => {
          alert(err.error?.error || 'Failed to reset password.');
          console.error('Reset password error:', err);
        }
      });
  }

}
