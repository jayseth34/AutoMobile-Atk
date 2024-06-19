import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyComponent } from '../add-party/add-party.component';
import { DataService } from 'src/app/services/data.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AddPartyGroupComponent } from '../add-party-group/add-party-group.component';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { fromEvent, Subscription } from 'rxjs';
import { buffer, debounceTime, filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-party-homepage',
  templateUrl: './party-homepage.component.html',
  styleUrls: ['./party-homepage.component.css']
})

export class PartyHomepageComponent {
  searchParty: string = '';
  searchGroup: string = '';
  // partyHomePageSelectedTab: string = 'party'; // Initially select the 'address' tab
  partyName: any = '';
  amount: any = '';
  groupname: any = '';
  registeredMobileNumber: any = '';
  // searchTerm: string = '';
  clickSubscription: Subscription;
  clicks: any[] = [];

  // filteredParties = [];
  filteredValues: string[];
  rows = [
    { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5' },
    { column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5' },
    { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5' },
    { column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5' }
  ];

  values = ['value1', 'value2', 'apple', 'mango']

@ViewChild('app-add-party') addPartyModal: AddPartyComponent;
  
constructor(private dialog: MatDialog, public dataService: DataService,private api: ApiService) {
  // this.filteredParties = this.rows.map(row => row.column1);
  this.filteredValues = this.values; // Initially show all values
}

ngAfterViewInit() {
  // Now the ViewChild is available
}

ngOnInit() {
  // Listen to click events on the document
  this.clickSubscription = fromEvent(document, 'click')
    .pipe(
      buffer(fromEvent(document, 'click').pipe(debounceTime(250))), // Collect clicks within 250ms
      map(clicks => clicks.length), // Count the number of clicks
      filter(clickCount => clickCount > 0) // Ignore if no clicks
    )
    .subscribe(clickCount => {
      if (clickCount === 1) {
        console.log('Single click');
      } else if (clickCount === 2) {
        console.log('Double click');
      }
    });
}

destroy$: Subject<boolean> = new Subject<boolean>();

// searchPartyName() {
  // this.filteredParties = this.rows.filter(row => {
  //   return row.column1.toLowerCase().includes(this.searchParty.toLowerCase());
  // });
// }

selectTab(tab: string) {
  // this.partyHomePageSelectedTab = tab;
  this.dataService.partyHomePageSelectedTab = tab;
}

openAddPartyModal(registeredMobileNumber: any, partyName: any) {
  if (partyName !== '' && registeredMobileNumber !== '') {
    this.api.getPartyDetails(registeredMobileNumber, partyName).subscribe({
      next: (res) => {
        if (res.status === "SUCCESS") {
          this.dataService.isPartyUpdate = true;
          this.dataService.oldPartyName = partyName
          const dialogRef = this.dialog.open(AddPartyComponent, {
            width: '60%',
            height: '99%',
            data: { partyDetails: res.partyList[0] , partyName} // Pass the data here
          });
        } else {
          this.dataService.isPartyUpdate = false;
          console.log("Failed to retrieve party details");
        }
      },
      error: () => {
        console.log("Error retrieving party details");
      }
    });
  } else {
    this.dataService.isPartyUpdate = false;
    const dialogRef = this.dialog.open(AddPartyComponent, {
      width: '60%',
      height: '99%',
    });
  }
}

openAddPartyGroupModal(registeredMobileNumber: any, groupname: any) {
  if (registeredMobileNumber!==''){
    this.api.GetPartyByGroup(registeredMobileNumber,groupname).subscribe({
      next: (res) => {
        // if (res.status === "SUCCESS") {
          if (res!=null) {
          this.dataService.isGroupUpdate = true;
          this.dataService.oldPartyGroupName = groupname
          const dialogRef = this.dialog.open(AddPartyGroupComponent, {
            width: '40%',
            height: '35%', 
            data: { groupDetails: groupname } // Pass the data here
          });
        } else {
          this.dataService.isGroupUpdate = false;
          console.log("Failed to retrieve party group details");
        }
      },
      error: () => {
        console.log("Error retrieving party group details");
      }
    });
  } else {
    const dialogRef = this.dialog.open(AddPartyGroupComponent, {
      width: '40%',
      height: '35%', 
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}

GetPartyDetailsData(registeredMobileNumber:any, partyName: any) {
  // debugger;
  console.log("onclick: ", partyName)
  // this.partyName = partyName;
  this.api.getPartyDetails(registeredMobileNumber,partyName).pipe(takeUntil(this.destroy$)).subscribe({
    next:(res) => {
      console.log("GETPARTDETAILS API: ",res);
      if(res.status == "SUCCESS") {
        this.dataService.partyDetailsResponse = res;
        this.api.getPartyTransactions(registeredMobileNumber,partyName).pipe(takeUntil(this.destroy$)).subscribe({
          next:(response) => {
            if(res.status == "SUCCESS"){
              this.dataService.transactionDetailsResponse =  response.partyTransactionsList
              console.log("TRANSACTION SUCCESS")
            }
            else{
              console.log("TRANSACTION FAILED")
            }
          },
          error:() => {
            console.log("TRANSACTION ERROR")
          },
        })
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
      if(res) {
        this.dataService.partyByGroupResponse = res.getPartyList
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


partyHandleClick(event: MouseEvent,registeredMobileNumber:any, partyName: any) {
  this.clicks.push(event);

  setTimeout(() => {
    if (this.clicks.length === 1) {
      // Single click detected
      this.GetPartyDetailsData('9920279905',partyName);
    } else if (this.clicks.length === 2) {
      // Double click detected
      this.openAddPartyModal('9920279905',partyName);
    }
    this.clicks = [];
  }, 250);
}

groupHandleClick(event: MouseEvent,registeredMobileNumber:any, partyGroupName: any){
  this.clicks.push(event);

  setTimeout(() => {
    if (this.clicks.length === 1) {
      // Single click detected
      this.GetPartyByGroupData('9920279905',partyGroupName);
    } else if (this.clicks.length === 2) {
      // Double click detected
      this.openAddPartyGroupModal('9920279905',partyGroupName);
    }
    this.clicks = [];
  }, 250);
}

// filteredData: { column1: string, column2: string }[] = [];

// onSearch() {
//   this.filteredData = this.rows.filter(item =>
//     item.column1.toLowerCase().includes(this.searchTerm.toLowerCase())
//   );
// }
ngOnDestroy() {
  // Unsubscribe to prevent memory leaks
  this.clickSubscription.unsubscribe();
}

}