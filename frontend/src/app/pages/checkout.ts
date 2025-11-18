import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare var Razorpay: any; // ✅ declare Razorpay global

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit {
  booking: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // ✅ Fetch latest booking (or pass via router state)
    this.http.get('http://localhost:5000/api/bookings/my-latest', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (data) => {
        this.booking = data;
        this.openRazorpay();
      },
      error: (err) => console.error('Error fetching booking:', err)
    });
  }

  openRazorpay() {
    if (!this.booking) return;

    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // ✅ from Razorpay Dashboard
      amount: this.booking.totalPrice * 100, // Razorpay works in paise
      currency: 'INR',
      name: 'Rentify',
      description: `Booking for ${this.booking.listing.title}`,
      image: '/assets/logo.png',
      handler: (response: any) => {
        console.log('Payment success:', response);
        alert('✅ Payment successful!');
        // ✅ Call backend to mark booking as paid
        this.http.put(`http://localhost:5000/api/bookings/${this.booking._id}/paid`, {
          paymentId: response.razorpay_payment_id
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).subscribe();
      },
      prefill: {
        email: this.booking.renter.email,
        contact: this.booking.renter.phone
      },
      theme: {
        color: '#22c55e'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}
