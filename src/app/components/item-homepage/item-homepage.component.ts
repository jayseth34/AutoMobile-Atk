import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddItemComponent } from '../add-item/add-item.component';

@Component({
  selector: 'app-item-homepage',
  templateUrl: './item-homepage.component.html',
  styleUrls: ['./item-homepage.component.css']
})
export class ItemHomepageComponent {

  constructor(private dialog: MatDialog){}

  rows = [
    { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
    { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
    { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
    { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  ];
  
  openAddItemModal() {
    const dialogRef = this.dialog.open(AddItemComponent, {
      width: '60%',
      height: '99%', // Adjust the width as needed
      // Other configuration options (e.g., height, data) can be added here
    });
  
    // Optionally, handle the result from the modal dialog
    dialogRef.afterClosed().subscribe(result => {
      // Handle the result here if needed
    });
  }

}
