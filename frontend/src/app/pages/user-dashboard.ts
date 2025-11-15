import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.scss']
})
export class UserDashboardComponent implements OnInit {
  listings: any[] = [];
  selectedListing: any = null;
  currentImageIndex = 0;
  showBookingModal = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5000/api/listings').subscribe(data => {
      this.listings = data;
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
}
