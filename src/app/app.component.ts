import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'automobile';
  currentRouteEndPoint = "";

  constructor(private router: Router, public dataService: DataService) {
    this.currentRouteEndPoint = router.url.split('/')[1];
    console.log(`Current Route: ${this.currentRouteEndPoint}`);
  }
}
