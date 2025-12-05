import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-manage-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-feedback.html',
  styleUrls: ['./manage-feedback.scss']
})
export class ManageFeedbackComponent implements OnInit {
  feedbacks: any[] = [];
  filteredFeedbacks: any[] = [];
  paginatedFeedbacks: any[] = [];
  statuses = ['new', 'reviewed', 'resolved'];

  searchTerm = '';
  filterCategory = '';
  filterStatus = '';

  currentPage = 1;
  pageSize = 5; // feedbacks per page
  totalPages = 1;

  private apiUrl = 'http://localhost:5000/api/feedback';

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.http.get<any[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .subscribe({
      next: (res) => {
        this.feedbacks = res;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load feedbacks:', err);
        alert('Failed to load feedbacks.');
      }
    });
  }

  applyFilters(): void {
    this.filteredFeedbacks = this.feedbacks.filter(fb => {
      const matchesSearch =
        !this.searchTerm ||
        fb.message.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (fb.user?.name || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.filterCategory || fb.category === this.filterCategory;
      const matchesStatus = !this.filterStatus || fb.status === this.filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    this.totalPages = Math.ceil(this.filteredFeedbacks.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedFeedbacks = this.filteredFeedbacks.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  changeStatus(feedbackId: string, newStatus: string): void {
    this.http.put(`${this.apiUrl}/${feedbackId}/status`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .subscribe({
      next: () => {
        alert('Status updated successfully!');
        this.loadFeedbacks();
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        alert('Failed to update status. Please try again.');
      }
    });
  }

  // ✅ Logout
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
