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
  private readonly silverMobileAllowedRoutes = new Set(['', 'login', 'register', 'plans']);

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

    // If user resizes/rotates into mobile on Silver plan, force them to Plans.
    if (this.isSilverPlan() && this.isMobileView && !this.isSilverMobileAllowedRoute()) {
      this.router.navigateByUrl('/plans');
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

  private isSilverPlan(): boolean {
    try {
      const planType = JSON.parse(localStorage.getItem('planType') as string);
      return (planType ?? '').toString().toLowerCase() === 'silver';
    } catch {
      return false;
    }
  }

  private isSilverMobileAllowedRoute(): boolean {
    const url = this.router.url || '/';
    const path = url.split('?')[0].split('#')[0];
    const segment = path.replace(/^\/+/, '').split('/')[0].toLowerCase();
    return this.silverMobileAllowedRoutes.has(segment);
  }
}
