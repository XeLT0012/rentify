import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.scss']
})
export class FeedbackComponent implements OnInit {
  feedback = {
    message: '',
    category: 'General Feedback',
    rating: null
  };

  selectedFile: File | null = null;
  myFeedbacks: any[] = [];
userName: string = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  this.userName = user?.name || '';   // ✅ assign to class property
    this.loadMyFeedbacks();
  }

  // ✅ Handle file selection
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // ✅ Submit feedback with file upload
  submitFeedback() {
    const formData = new FormData();
    formData.append('message', this.feedback.message);
    formData.append('category', this.feedback.category);
    if (this.feedback.rating !== null && this.feedback.rating !== undefined) {
  formData.append('rating', String(this.feedback.rating));
}
    if (this.selectedFile) {
      formData.append('screenshot', this.selectedFile);
    }

    this.http.post('http://localhost:5000/api/feedback', formData, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
}).subscribe({
        next: (res: any) => {
          console.log('Feedback submitted:', res);
          alert('Feedback submitted successfully!');
          this.feedback = { message: '', category: 'General Feedback', rating: null };
          this.selectedFile = null;
          this.loadMyFeedbacks(); // refresh list
        },
        error: (err) => {
          console.error('Failed to submit feedback:', err);
          alert('Failed to submit feedback. Please try again.');
        }
      });
  }

  // ✅ Load user’s feedback history
  loadMyFeedbacks() {
    this.http.get<any[]>('http://localhost:5000/api/feedback/my-feedback', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
}).subscribe({
        next: (res) => {
          this.myFeedbacks = res;
        },
        error: (err) => {
          console.error('Failed to load feedback history:', err);
        }
      });
  }
  logout() {
    this.auth.logout();
    alert('You have been logged out.');
  }
}
