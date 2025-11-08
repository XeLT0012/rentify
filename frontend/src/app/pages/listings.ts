import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listings.html',
  styleUrls: ['./listings.scss']
})
export class ListingsComponent implements OnInit {
  listings: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:5000/api/listings')
      .subscribe({
        next: data => this.listings = data,
        error: err => {
          alert('Failed to load listings.');
          console.error('Error fetching listings:', err);
        }
      });
  }
}
