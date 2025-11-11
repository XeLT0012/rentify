import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss']
})
export class NotFoundComponent {
  backLink: string = '/';

  constructor(private router: Router) {}

  ngOnInit() {
    const role = localStorage.getItem('role'); // role saved at login
    if (role === 'admin') {
      this.backLink = '/admin';
    } else if (role === 'user') {
      this.backLink = '/dashboard';
    } else {
      this.backLink = '/'; // fallback to home
    }
  }
}
