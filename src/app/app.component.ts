import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from './services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'automobile';
  currentRouteEndPoint = "";
  isMobileView = window.innerWidth <= 991.98;
  isMobileSidebarOpen = false;

  constructor(private router: Router, public dataService: DataService, private dialog: MatDialog) {
    this.currentRouteEndPoint = router.url.split('/')[1];
  }

  ngOnInit(): void {
    this.recoverScrollLockIfStuck();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.recoverScrollLockIfStuck());
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobileView = window.innerWidth <= 991.98;
    if (!this.isMobileView) {
      this.isMobileSidebarOpen = false;
    }
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    if (this.isMobileView) {
      this.isMobileSidebarOpen = false;
    }
  }

  private recoverScrollLockIfStuck(): void {
    if (this.dialog.openDialogs.length > 0) return;
    const body = document.body;
    if (!body.classList.contains('cdk-global-scrollblock')) return;

    body.classList.remove('cdk-global-scrollblock');
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.width = '';
    body.style.overflow = '';
  }
}
