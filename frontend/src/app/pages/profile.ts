import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent {
  user: any = {};
  editMode = false;
  profileImageFile: File | null = null;
userName: string = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  this.userName = user?.name || '';   // ✅ assign to class property
    const token = localStorage.getItem('token');
    this.http.get('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(data => this.user = data);
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  handleFileInput(event: any) {
    this.profileImageFile = event.target.files[0];
  }

  saveProfile() {
  if (!this.user.name || !this.user.email) {
    alert('Name and Email are required!');
    return;
  }

  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('name', this.user.name || '');
  formData.append('email', this.user.email || '');
  formData.append('bio', this.user.bio || '');
  formData.append('phone', this.user.phone || '');
  formData.append('address', this.user.address || '');
  if (this.profileImageFile) {
    formData.append('profileImage', this.profileImageFile);
  }

  this.http.put('http://localhost:5000/api/users/profile', formData, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe(updated => {
    this.user = updated;
    this.editMode = false;
  });
}

logout() {
  this.auth.logout();
  alert('You have been logged out.');
}

}
