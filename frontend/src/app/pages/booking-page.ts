import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-page.html',
  styleUrls: ['./booking-page.scss']
})
export class BookingPageComponent implements OnInit {
  listing: any;
  startDate = '';
  endDate = '';
  notes = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost:5000/api/listings/${id}`).subscribe(data => {
      this.listing = data;
    });
  }

  get totalPrice(): number {
    if (!this.startDate || !this.endDate || !this.listing?.price) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days * this.listing.price;
  }

  confirmBooking() {
  if (!this.startDate || !this.endDate) {
    alert('❌ Please select both start and end dates.');
    return;
  }

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const availableFrom = new Date(this.listing.availableFrom);
  const availableUntil = new Date(this.listing.availableUntil);

  // Validation checks
  if (start < availableFrom || end > availableUntil) {
    alert(`❌ Please choose dates between ${availableFrom.toDateString()} and ${availableUntil.toDateString()}.`);
    return;
  }

  if (end <= start) {
    alert('❌ End date must be after start date.');
    return;
  }

  const bookingData = {
    listing: this.listing._id,
    startDate: this.startDate,
    endDate: this.endDate,
    notes: this.notes,
    totalPrice: this.totalPrice
  };

  const token = localStorage.getItem('token');

  this.http.post('http://localhost:5000/api/bookings', bookingData, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: () => {
      alert('✅ Booking confirmed successfully!');
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      alert('❌ Failed to confirm booking: ' + (err.error?.error || 'Server error'));
    }
  });
}


}
