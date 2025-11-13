import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-add-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-listing.html',
  styleUrls: ['./add-listing.scss']
})
export class AddListingComponent {
  title = '';
  description = '';
  price: number | null = null;
  category = '';
  isFeatured = false;
  imageFile: File | null = null;

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  handleFileInput(event: any) {
    this.imageFile = event.target.files[0];
  }

  submit() {
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in.');

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('price', this.price?.toString() || '');
    formData.append('category', this.category);
    formData.append('isFeatured', this.isFeatured.toString());

    if (this.imageFile) {
      formData.append('image', this.imageFile); // ✅ must match backend field name
    }

    this.http.post('http://localhost:5000/api/listings', formData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert('Listing created!');
        this.router.navigate(['/listings']);
      },
      error: err => {
  console.error('🔥 Full backend error:', err.error);

  const message = err.error?.error || err.error?.message || 'Unknown error';
  const details = err.error?.details ? JSON.stringify(err.error.details) : '';

  alert(`Error ${err.status}: ${message}\n${details}`);}});
  }

  logout() {
  this.auth.logout();
  alert('You have been logged out.');
}
}
