import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyComponent } from '../add-party/add-party.component';
import { ApiService } from 'src/app/services/api.service';
import { takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  constructor(public dialog: MatDialog, private api: ApiService) { }
 
  openDialog(): void {
    const dialogRef = this.dialog.open(AddPartyComponent, {
      width: '1000px',
      maxHeight: '1000px' 
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  getPartyListData(registeredMobileNumber: any) {
    this.api.getPartyList(registeredMobileNumber).pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        console.log("GETPARTYLIST API: ",res);
        if(res.message == "Success" && res.status == 1) {
          console.log("successs")
        }
        else {
          console.log("failed")
        }
      },
      error:() => {
        console.log("errorrrr")
      }
    })
  }

}
