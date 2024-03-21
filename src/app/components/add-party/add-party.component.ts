import { Component } from '@angular/core';

@Component({
  selector: 'app-add-party',
  templateUrl: './add-party.component.html',
  styleUrls: ['./add-party.component.css']
})
export class AddPartyComponent {
  selectedTab: string = 'address'; // Initially select the 'address' tab

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

}
