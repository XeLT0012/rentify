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
  // 📝 Essential Item Details
  title = '';
  category = '';
  description = '';
  condition = '';

  // 💰 Rental Information
  price: number = 0;
  availableFrom: string = '';
  availableUntil: string = '';

  // 📍 Location & Logistics
  deliveryOption = '';
  location = '';

  // 👤 Owner Information
  contactPreference = '';

  // 📸 Media
  imageFiles: File[] = [];

  // ✅ Trust & Safety
  terms = '';

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  handleFileInput(event: any) {
    this.imageFiles = Array.from(event.target.files);
  }

  submit() {
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in.');

    if (!this.title || !this.category || !this.price || !this.condition || !this.location) {
      return alert('Please fill all required fields.');
    }

    const formData = new FormData();
    // 📝 Essential Item Details
    formData.append('title', this.title);
    formData.append('category', this.category);
    formData.append('description', this.description);
    formData.append('condition', this.condition);

    // 💰 Rental Information
    formData.append('price', this.price.toString());
    if (this.availableFrom) formData.append('availableFrom', this.availableFrom);
    if (this.availableUntil) formData.append('availableUntil', this.availableUntil);

    // 📍 Location & Logistics
    formData.append('deliveryOption', this.deliveryOption);
    formData.append('location', this.location);

    // 👤 Owner Information
    formData.append('contactPreference', this.contactPreference);

    // 📸 Media
    this.imageFiles.forEach(file => formData.append('images', file));

    // ✅ Trust & Safety
    formData.append('terms', this.terms);

    this.http.post('http://localhost:5000/api/listings', formData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert('Listing created successfully!');
        this.router.navigate(['/listings']);
      },
      error: err => {
        console.error('🔥 Full backend error:', err.error);
        const message = err.error?.error || err.error?.message || 'Unknown error';
        const details = err.error?.details ? JSON.stringify(err.error.details) : '';
        alert(`Error ${err.status}: ${message}\n${details}`);
      }
    });
  }

  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }
}
