import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';

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

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private auth: AuthService) {}

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
    if (days <= 0) return 0;

    let basePrice = days * this.listing.price;

    // ✅ Apply long rental discount
    if (days >= 30) {
      basePrice *= 0.9; // 10% discount
    } else if (days >= 7) {
      basePrice *= 0.95; // 5% discount
    }

    // ✅ Add platform fee (10%)
    const platformFee = basePrice * 0.1;
    return basePrice + platformFee;
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

  if (start < availableFrom || end > availableUntil) {
    alert(`❌ Please choose dates between ${availableFrom.toDateString()} and ${availableUntil.toDateString()}.`);
    return;
  }

  if (end <= start) {
    alert('❌ End date must be after start date.');
    return;
  }

  // ✅ Prepare booking data
  const bookingData = {
    listing: this.listing._id,
    startDate: this.startDate,
    endDate: this.endDate,
    notes: this.notes,
    totalPrice: this.totalPrice,
    status: 'pending'
  };

  // ✅ Razorpay checkout
  const options = {
    key: 'rzp_test_RhBUwUsRvmnv6e',
    amount: this.totalPrice * 100, // paise
    currency: 'INR',
    name: 'Rentify',
    description: `Booking for ${this.listing.title}`,
    handler: (response: any) => {
      console.log('✅ Razorpay payment success:', response);

      const token = localStorage.getItem('token');

      // Step 1: Create booking
      this.http.post('http://localhost:5000/api/bookings',
        { ...bookingData, paymentId: response.razorpay_payment_id },
        { headers: { Authorization: `Bearer ${token}` } }
      ).subscribe({
        next: (createdBooking: any) => {
          console.log('✅ Booking created:', createdBooking);

          // Step 2: Mark booking as paid (triggers email)
          this.http.put(`http://localhost:5000/api/bookings/${createdBooking._id}/paid`,
            { paymentId: response.razorpay_payment_id },
            { headers: { Authorization: `Bearer ${token}` } }
          ).subscribe({
            next: () => {
              console.log('📩 Booking marked as paid & email sent');
              alert('✅ Booking confirmed and email sent!');
              this.router.navigate(['/dashboard']);
            },
            error: (err) => {
              console.error('🔥 Failed to mark booking as paid:', err);
              alert('❌ Booking created but failed to send confirmation email.');
            }
          });
        },
        error: (err) => {
          console.error('🔥 Failed to create booking:', err);
          alert('❌ Failed to create booking: ' + (err.error?.error || 'Server error'));
        }
      });
    },
    prefill: {
      email: 'user@example.com',
      contact: '9999999999'
    },
    theme: { color: '#22c55e' }
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}

  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }
}
