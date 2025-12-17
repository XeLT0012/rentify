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
  loading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    this.http.get<any[]>('http://localhost:5000/api/bookings/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .subscribe({
      next: data => {
        this.bookings = data;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to fetch bookings:', err);
        this.errorMessage = '❌ Could not load your bookings.';
        this.loading = false;
      }
    });
  }

  downloadInvoice(bookingId: string) {
  const token = localStorage.getItem('token');
  this.http.get(`http://localhost:5000/api/bookings/${bookingId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  }).subscribe({
    next: (res: Blob) => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${bookingId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: err => {
      console.error('Failed to download invoice:', err);
      alert('❌ Could not download invoice.');
    }
  });
}

viewInvoice(bookingId: string) {
  const token = localStorage.getItem('token');
  this.http.get(`http://localhost:5000/api/bookings/${bookingId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  }).subscribe({
    next: (res: Blob) => {
      const url = window.URL.createObjectURL(res);
      window.open(url, '_blank'); // ✅ opens in new tab
    },
    error: err => {
      console.error('Failed to view invoice:', err);
      alert('❌ Could not open invoice.');
    }
  });
}

  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }
}
