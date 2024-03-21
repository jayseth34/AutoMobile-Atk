import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyComponent } from '../add-party/add-party.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  constructor(public dialog: MatDialog) { }
 
  openDialog(): void {
    const dialogRef = this.dialog.open(AddPartyComponent, {
      width: '1000px',
      maxHeight: '1000px' // adjust width as per your requirement
      // Other configuration options as needed
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // You can perform actions here after dialog close if needed
    });
  }

}
