import { Component } from '@angular/core';

@Component({
  selector: 'app-business-information',
  templateUrl: './business-information.component.html',
  styleUrls: ['./business-information.component.css']
})
export class BusinessInformationComponent {
  showBusinessDetails: boolean = false;

  constructor(){ }

  toggleBusinessDetails() {
    this.showBusinessDetails = !this.showBusinessDetails;
  }

}
