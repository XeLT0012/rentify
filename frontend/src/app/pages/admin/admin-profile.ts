import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.scss']
})
export class AdminProfileComponent implements OnInit {
  admin: any = null;
  editMode = false;
  updatedAdmin: any = { name: '', email: '', phone: '', address: '', bio: '' };
  selectedFile: File | null = null;

  private apiUrl = 'http://localhost:5000/api/users/admin/profile';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAdminProfile();
  }

  loadAdminProfile(): void {
    this.http.get<any>(this.apiUrl, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => {
        this.admin = res;
        this.updatedAdmin = {
          name: res.name,
          email: res.email,
          phone: res.phone || '',
          address: res.address || '',
          bio: res.bio || ''
        };
      },
      error: (err) => console.error('Failed to load admin profile:', err)
    });
  }

  enableEdit(): void {
    this.editMode = true;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  saveProfile(): void {
    const formData = new FormData();
    formData.append('name', this.updatedAdmin.name);
    formData.append('email', this.updatedAdmin.email);
    formData.append('phone', this.updatedAdmin.phone);
    formData.append('address', this.updatedAdmin.address);
    formData.append('bio', this.updatedAdmin.bio);
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.http.put<any>(this.apiUrl, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => {
        alert('Profile updated successfully!');
        this.admin = res.admin;
        this.editMode = false;
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        alert('Failed to update profile.');
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
