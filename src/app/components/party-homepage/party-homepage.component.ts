import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyComponent } from '../add-party/add-party.component';
import { DataService } from 'src/app/services/data.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AddPartyGroupComponent } from '../add-party-group/add-party-group.component';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-party-homepage',
  templateUrl: './party-homepage.component.html',
  styleUrls: ['./party-homepage.component.css']
})

export class PartyHomepageComponent {
  searchParty: string = '';
  selectedTab: string = 'party'; // Initially select the 'address' tab
  partyName: any = '';
  groupname: any = '';
  registeredMobileNumber: any = '';

  // filteredParties = [];
  filteredValues: string[];
  rows = [
    { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5' },
    { column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5' },
    { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5' },
    { column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5' }
  ];

  values = ['value1', 'value2', 'apple', 'mango']

constructor(private dialog: MatDialog, public dataService: DataService,private api: ApiService) {
  // this.filteredParties = this.rows.map(row => row.column1);
  this.filteredValues = this.values; // Initially show all values
}

destroy$: Subject<boolean> = new Subject<boolean>();

// searchPartyName() {
  // this.filteredParties = this.rows.filter(row => {
  //   return row.column1.toLowerCase().includes(this.searchParty.toLowerCase());
  // });
// }

selectTab(tab: string) {
  this.selectedTab = tab;
}

openAddPartyModal() {
  const dialogRef = this.dialog.open(AddPartyComponent, {
    width: '60%',
    height: '99%', 
  });
  dialogRef.afterClosed().subscribe(result => {
  });
}

openAddPartyGroupModal() {
  const dialogRef = this.dialog.open(AddPartyGroupComponent, {
    width: '40%',
    height: '35%', 
  });
  dialogRef.afterClosed().subscribe(result => {
  });
}

GetPartyDetailsData(registeredMobileNumber:any, partyName: any) {
  console.log("onclick: ", partyName)
  this.partyName = partyName;
  this.api.getPartyDetails(registeredMobileNumber,partyName).pipe(takeUntil(this.destroy$)).subscribe({
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

GetPartyByGroupData(registeredMobileNumber:any, groupname: any) {
  console.log("onclick: ", groupname)
  this.groupname = groupname;
  this.api.GetPartyByGroup(registeredMobileNumber,groupname).pipe(takeUntil(this.destroy$)).subscribe({
    next:(res) => {
      console.log("GETPARTYGROUPLIST API: ",res);
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