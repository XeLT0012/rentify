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

  // Vendor-specific
userType = ''; // 'vendor' or 'standalone'
shopLocation = '';
experience = '';
certifications = '';

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

  // If vendor, enforce vendor-specific fields
  if (this.userType === 'vendor' && (!this.shopLocation || !this.experience)) {
    return alert('Vendor details are required.');
  }

  const formData = new FormData();
  formData.append('title', this.title);
  formData.append('category', this.category);
  formData.append('description', this.description);
  formData.append('condition', this.condition);
  formData.append('price', this.price.toString());
  if (this.availableFrom) formData.append('availableFrom', this.availableFrom);
  if (this.availableUntil) formData.append('availableUntil', this.availableUntil);
  formData.append('deliveryOption', this.deliveryOption);
  formData.append('location', this.location);
  formData.append('contactPreference', this.contactPreference);

  // Vendor-specific fields
  formData.append('userType', this.userType);
  if (this.userType === 'vendor') {
    formData.append('shopLocation', this.shopLocation);
    formData.append('experience', this.experience);
    if (this.certifications) formData.append('certifications', this.certifications);
  }

  this.imageFiles.forEach(file => formData.append('images', file));
  formData.append('terms', this.terms);

  // ✅ Approval status always starts as pending
  formData.append('approvalStatus', 'pending');

  this.http.post('http://localhost:5000/api/listings', formData, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: () => {
      alert('Listing submitted for admin approval!');
      this.router.navigate(['/listings']);
    },
    error: err => {
      console.error('🔥 Full backend error:', err.error);
      const message = err.error?.error || err.error?.message || 'Unknown error';
      alert(`Error ${err.status}: ${message}`);
    }
  });
}

  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }
}
