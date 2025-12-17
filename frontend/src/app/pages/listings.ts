import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './listings.html',
  styleUrls: ['./listings.scss']
})
export class ListingsComponent implements OnInit {
  listings: any[] = [];
expandedListing: any | null = null;
expandedBookings: any[] = [];
isEditMode: boolean = false;
userName: string = '';

constructor(
  private http: HttpClient,
  private auth: AuthService,
  private router: Router
) {}

ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  this.userName = user?.name || '';   // ✅ assign to class property
  const token = localStorage.getItem('token');
  this.http.get<any[]>('http://localhost:5000/api/listings/my-listings', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .subscribe({
    next: data => {
      console.log('My Listings:', data);

      // ✅ Show all listings created by the current user
      // (pending, approved, rejected)
      this.listings = data.map(item => {
        return {
          ...item,
          approvalStatus: item.approvalStatus || 'pending' // fallback if missing
        };
      });
    },
    error: err => {
      alert('Failed to load your listings.');
      console.error('Error fetching listings:', err);
    }
  });
}


  // 🔹 Open listing in modal (without image)
  openListing(listing: any) {
    this.expandedListing = { ...listing };
    this.isEditMode = false;

    const token = localStorage.getItem('token');
    this.http.get<any[]>(`http://localhost:5000/api/bookings/listing/${listing._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: data => {
        // ✅ bookings now include renter details
        this.expandedBookings = data;
      },
      error: err => console.error('Error fetching bookings:', err)
    });
  }

  closeModal() {
    this.expandedListing = null;
    this.expandedBookings = [];
    this.isEditMode = false;
  }

  enableEdit() {
    this.isEditMode = true;
  }

  saveListing() {
    if (!this.expandedListing) return;

    const token = localStorage.getItem('token');
    this.http.put(`http://localhost:5000/api/listings/${this.expandedListing._id}`,
      this.expandedListing,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: updated => {
        this.listings = this.listings.map((l: any) =>
          l._id === (updated as any)._id ? updated : l
        );
        this.expandedListing = updated;
        this.isEditMode = false;
        alert('Listing updated successfully.');
      },
      error: err => {
        alert('Failed to update listing.');
        console.error('Error updating listing:', err);
      }
    });
  }

  deleteListing(id: string) {
    if (confirm('Are you sure you want to delete this listing?')) {
      const token = localStorage.getItem('token');
      this.http.delete(`http://localhost:5000/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.listings = this.listings.filter(l => l._id !== id);
          this.closeModal();
          alert('Listing deleted successfully.');
        },
        error: err => {
          alert(err.error?.error || 'Failed to delete listing (Booking may already present).');
          console.error('Error deleting listing:', err);
        }
      });
    }
  }

  confirmBooking(bookingId: string) {
    const token = localStorage.getItem('token');
    this.http.put(`http://localhost:5000/api/bookings/${bookingId}/status`,
      { status: 'confirmed' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe(() => {
      alert('Booking confirmed.');
      this.expandedBookings = this.expandedBookings.map(b =>
        b._id === bookingId ? { ...b, status: 'confirmed' } : b
      );
    });
  }

  rejectBooking(bookingId: string) {
    const token = localStorage.getItem('token');
    this.http.put(`http://localhost:5000/api/bookings/${bookingId}/status`,
      { status: 'cancelled' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe(() => {
      alert('Booking rejected.');
      this.expandedBookings = this.expandedBookings.map(b =>
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      );
    });
  }

  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }
}
