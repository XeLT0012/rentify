import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-bookings.html',
  styleUrls: ['./manage-bookings.scss']
})
export class ManageBookingsComponent implements OnInit {
  bookings: any[] = [];
  selectedBooking: any = null;

  // ✅ Search + Filter
  searchTerm: string = '';
  filterStatus: string = '';

  // ✅ Pagination
  currentPage: number = 1;
  pageSize: number = 5;

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  // ✅ Load all bookings
  loadBookings() {
    this.http.get<any[]>('http://localhost:5000/api/bookings')
      .subscribe({
        next: (res) => {
          this.bookings = res;
        },
        error: (err) => console.error('Failed to load bookings:', err)
      });
  }

  // ✅ Filter + Search logic
  filteredBookings(): any[] {
    return this.bookings.filter(b => {
      const matchesSearch =
        !this.searchTerm ||
        b._id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        b.item?.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        b.renter?.name?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesFilter =
        !this.filterStatus || b.status === this.filterStatus;

      return matchesSearch && matchesFilter;
    });
  }

  // ✅ Pagination controls
  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredBookings().length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ✅ View booking details in modal
  viewBooking(booking: any) {
    this.selectedBooking = booking;
  }

  // ✅ Close modal
  closeBooking() {
    this.selectedBooking = null;
  }

  // ✅ Logout
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
