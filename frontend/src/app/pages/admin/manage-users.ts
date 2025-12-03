import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.scss']
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  searchTerm: string = '';
  selectedUser: any = null;

  // ✅ Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ✅ Load users from backend
  loadUsers(): void {
    this.http.get<any[]>('http://localhost:5000/api/users')
      .subscribe({
        next: res => this.users = res,
        error: err => console.error('Failed to load users:', err)
      });
  }

  // ✅ Search & Filter
  filteredUsers() {
    return this.users.filter(u =>
      (u.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       u.email?.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  // ✅ Pagination controls
  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredUsers().length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ✅ Block user
  blockUser(id: string) {
    this.http.put(`http://localhost:5000/api/users/${id}/block`, {})
      .subscribe({
        next: () => {
          const user = this.users.find(u => u._id === id);
          if (user) user.blocked = true;
        },
        error: err => console.error('Failed to block user:', err)
      });
  }

  // ✅ Unblock user
  unblockUser(id: string) {
    this.http.put(`http://localhost:5000/api/users/${id}/unblock`, {})
      .subscribe({
        next: () => {
          const user = this.users.find(u => u._id === id);
          if (user) user.blocked = false;
        },
        error: err => console.error('Failed to unblock user:', err)
      });
  }

  // ✅ Profile modal
  viewProfile(user: any) {
    this.selectedUser = user;
  }

  closeProfile() {
    this.selectedUser = null;
  }

  // ✅ Logout
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
