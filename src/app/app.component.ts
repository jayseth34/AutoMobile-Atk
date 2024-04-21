import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'automobile';
  currentRouteEndPoint = "";

  constructor(private router: Router) {
    this.currentRouteEndPoint = router.url.split('/')[1];
    console.log(`Current Route: ${this.currentRouteEndPoint}`);
  }
}
