import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {
  products: any[] = [];

  constructor(private auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
  this.http.get<any[]>('http://localhost:5000/api/listings')
    .subscribe({
      next: res => {
        this.products = res;
        console.log('Products loaded:', this.products);
      },
      error: err => console.error('Failed to load products:', err)
    });
}


  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }
}
