import { Component } from '@angular/core';
// import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { BanksComponent } from '../banks/banks.component';


@Component({
  selector: 'app-bank-homepage',
  templateUrl: './bank-homepage.component.html',
  styleUrls: ['./bank-homepage.component.css']
})
export class BankHomepageComponent {
  constructor(public dialog: MatDialog) {}

  openAddBanksModal(): void {
    this.dialog.open(BanksComponent, {
      width: '70%',  
      height: '90%',
    });
  }

}
