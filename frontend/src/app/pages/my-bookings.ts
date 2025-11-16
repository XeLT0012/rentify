import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.html',
  styleUrls: ['./my-bookings.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
  const token = localStorage.getItem('token');

  this.http.get<any[]>('http://localhost:5000/api/bookings', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .subscribe({
    next: data => this.bookings = data,
    error: err => console.error('Failed to fetch bookings:', err)
  });
}


  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }
}
