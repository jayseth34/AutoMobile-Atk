import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SelectUnitComponent } from '../select-unit/select-unit.component';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent {
  selectedTab: string = 'pricing';
  showSelectUnit = false;
  isWholesalePriceEnabled: boolean = true;

  constructor(private dialog: MatDialog) {}

  ngOninit() {

  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  // showSelectUnitModal() {
  //   this.showSelectUnit = !this.showSelectUnit;
  // }

  toggleWholesalePrice() {
    debugger;
    this.isWholesalePriceEnabled = !this.isWholesalePriceEnabled;
  }

  openSelectUnitModal() {
    debugger;
    const dialogRef = this.dialog.open(SelectUnitComponent, {
      width: '40%',
      height: '45%', // Adjust the width as needed
      // Other configuration options (e.g., height, data) can be added here
    });
  
    // Optionally, handle the result from the modal dialog
    dialogRef.afterClosed().subscribe(result => {
      // Handle the result here if needed
    });
  }

}
