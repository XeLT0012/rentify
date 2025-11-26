import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.scss']
})
export class UserDashboardComponent implements OnInit {
  listings: any[] = [];
filteredListings: any[] = [];
selectedListing: any = null;
currentImageIndex = 0;
searchTerm = '';
sortOption = 'priceLowToHigh';

constructor(private http: HttpClient, private auth: AuthService) {}

ngOnInit() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = user._id; // ✅ exists now

  this.http.get<any[]>('http://localhost:5000/api/listings').subscribe(data => {
    // 🔍 Debug logs
    console.log('Current User ID:', currentUserId);
    console.log('Listing Owners:', data.map(l => l.owner));
    console.log('Approval Statuses:', data.map(l => l.approvalStatus));

    // ✅ filter out listings created by current user
    // ✅ only show listings that are approved
    this.listings = data.filter(item => {
      const ownerId = typeof item.owner === 'string' ? item.owner : item.owner?._id;
      return ownerId !== currentUserId && item.approvalStatus === 'approved';
    });

    this.applyFilters();
  });
}


  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }

  openPopup(listing: any) {
    this.selectedListing = listing;
    this.currentImageIndex = 0;
    document.body.style.overflow = 'hidden';
  }

  closePopup() {
    this.selectedListing = null;
    document.body.style.overflow = 'auto';
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.selectedListing?.images?.length) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedListing.images.length;
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (this.selectedListing?.images?.length) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.selectedListing.images.length) % this.selectedListing.images.length;
    }
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();

    this.filteredListings = this.listings
      .filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        if (this.sortOption === 'priceLowToHigh') return a.price - b.price;
        if (this.sortOption === 'priceHighToLow') return b.price - a.price;
        if (this.sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }
}
