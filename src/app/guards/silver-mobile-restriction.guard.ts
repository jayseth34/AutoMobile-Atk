import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SilverMobileRestrictionGuard implements CanActivate {
  private readonly mobileBreakpoint = 991.98;
  private readonly allowedRoutesOnSilverMobile = new Set([
    '',
    'login',
    'register',
    'plans'
  ]);

  constructor(private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.isSilverPlan() || !this.isMobileView()) {
      return true;
    }

    const routeSegment = this.getRouteSegment(state.url).toLowerCase();
    if (this.allowedRoutesOnSilverMobile.has(routeSegment)) {
      return true;
    }

    return this.router.createUrlTree(['/plans']);
  }

  private getRouteSegment(url: string): string {
    const path = (url || '/').split('?')[0].split('#')[0];
    return path.replace(/^\/+/, '').split('/')[0] || '';
  }

  private isMobileView(): boolean {
    return window.innerWidth <= this.mobileBreakpoint;
  }

  private isSilverPlan(): boolean {
    try {
      const planType = JSON.parse(localStorage.getItem('planType') as string);
      return (planType ?? '').toString().toLowerCase() === 'silver';
    } catch {
      return false;
    }
  }
}

