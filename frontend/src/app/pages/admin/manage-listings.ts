import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-manage-listings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-listings.html',
  styleUrls: ['./manage-listings.scss']
})
export class ManageListingsComponent implements OnInit {
  listings: any[] = [];
  searchTerm: string = '';
  filterStatus: string = '';   // ✅ new filter dropdown binding
  selectedListing: any = null;

  // ✅ Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  // ✅ Load listings (admin view: all statuses)
  loadListings(): void {
    this.http.get<any[]>('http://localhost:5000/api/listings/all')
      .subscribe({
        next: res => this.listings = res,
        error: err => console.error('Failed to load listings:', err)
      });
  }

  // ✅ Search & Filter
  filteredListings() {
    return this.listings.filter(l => {
      const matchesSearch =
        l.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        l.category?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        l.location?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesFilter =
        !this.filterStatus ||
        (this.filterStatus === 'featured' && l.featured) ||
        l.approvalStatus?.toLowerCase() === this.filterStatus.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }

  // ✅ Pagination controls
  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredListings().length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ✅ Approve listing
  approveListing(id: string) {
    this.http.put(`http://localhost:5000/api/listings/${id}/approve`, {})
      .subscribe({
        next: (res: any) => {
          const index = this.listings.findIndex(l => l._id === id);
          if (index !== -1) {
            this.listings[index] = res.listing; // ✅ replace with backend response
          }
        },
        error: err => console.error('Failed to approve listing:', err)
      });
  }

  // ✅ Reject listing
  rejectListing(id: string) {
    this.http.put(`http://localhost:5000/api/listings/${id}/reject`, {})
      .subscribe({
        next: (res: any) => {
          const index = this.listings.findIndex(l => l._id === id);
          if (index !== -1) {
            this.listings[index] = res.listing; // ✅ replace with backend response
          }
        },
        error: err => console.error('Failed to reject listing:', err)
      });
  }

  // ✅ Listing modal
viewListing(listing: any) {
  // clone object so edits don’t immediately affect table until saved
  this.selectedListing = { ...listing, editing: false };
}

closeListing() {
  this.selectedListing = null;
}

// ✅ Save listing (modal update)
saveListing(listing: any) {
  this.http.put(`http://localhost:5000/api/listings/${listing._id}/edit`, listing)
    .subscribe({
      next: (res: any) => {
        const index = this.listings.findIndex(l => l._id === listing._id);
        if (index !== -1) {
          this.listings[index] = res.listing; // ✅ update local array
        }
        this.selectedListing = null; // ✅ close modal after save
        console.log('Listing updated successfully:', res);
      },
      error: err => console.error('Failed to update listing:', err)
    });
}

// ✅ Cancel edit (switch back to view mode)
cancelEdit(listing: any) {
  listing.editing = false;
}

  // ✅ Toggle featured status
  toggleFeatured(listing: any) {
    const newStatus = !listing.featured;

    this.http.put(`http://localhost:5000/api/listings/${listing._id}/featured`, { featured: newStatus })
      .subscribe({
        next: (res: any) => {
          const index = this.listings.findIndex(l => l._id === listing._id);
          if (index !== -1) {
            this.listings[index] = res.listing; // ✅ update with backend response
          }
          console.log('Featured status updated:', res);
        },
        error: err => console.error('Failed to update featured status:', err)
      });
  }

  // ✅ Logout
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
