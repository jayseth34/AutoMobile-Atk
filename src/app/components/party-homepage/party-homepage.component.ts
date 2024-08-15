import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyComponent } from '../add-party/add-party.component';
import { DataService } from 'src/app/services/data.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AddPartyGroupComponent } from '../add-party-group/add-party-group.component';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { fromEvent, Subscription } from 'rxjs';
import { buffer, debounceTime, filter, map } from 'rxjs/operators';
import { Party } from 'src/app/models';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-party-homepage',
  templateUrl: './party-homepage.component.html',
  styleUrls: ['./party-homepage.component.css'],
})

export class PartyHomepageComponent {
  selectedGroup: any = '';
  selectedParty: any = ''; 
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
  partyList: Party[] = [];
  ispartygrouplistresponse: boolean = false;
  phonenumber:any = 0;
  billingaddress:any = '';
  emailid:any = '';
  gst:any = '';
  creditlimit:any = 0;

  // filteredParties = [];
  filteredValues: string[];
  rows = [
    {
      column1: 'Row 2, Column 1',
      column2: 'Row 2, Column 2',
      column3: 'Row 2, Column 3',
      column4: 'Row 2, Column 4',
      column5: 'Row 2, Column 5',
    },
    {
      column1: 'Row 1, Column 1',
      column2: 'Row 1, Column 2',
      column3: 'Row 1, Column 3',
      column4: 'Row 1, Column 4',
      column5: 'Row 1, Column 5',
    },
    {
      column1: 'Row 2, Column 1',
      column2: 'Row 2, Column 2',
      column3: 'Row 2, Column 3',
      column4: 'Row 2, Column 4',
      column5: 'Row 2, Column 5',
    },
    {
      column1: 'Row 1, Column 1',
      column2: 'Row 1, Column 2',
      column3: 'Row 1, Column 3',
      column4: 'Row 1, Column 4',
      column5: 'Row 1, Column 5',
    },
  ];

  values = ['value1', 'value2', 'apple', 'mango'];

  @ViewChild('app-add-party') addPartyModal: AddPartyComponent;

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    private api: ApiService,
    public cs: CommonService,
    private cdr: ChangeDetectorRef
  ) {
    // this.filteredParties = this.rows.map(row => row.column1);
    this.filteredValues = this.values; // Initially show all values
  }

  ngOnInit() {
    // Listen to click events on the document
    this.registeredMobileNumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
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

    this.selectTab('party');

    // this.getPartyListData();
    // if (this.partyList.length > 0) {
    //   this.selectedParty = this.partyList[0].partyname; // Set the first party as selected
    // }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  // searchPartyName() {
  // this.filteredParties = this.rows.filter(row => {
  //   return row.column1.toLowerCase().includes(this.searchParty.toLowerCase());
  // });
  // }
  getPartyListData() {
    this.api
      .getPartyList(this.registeredMobileNumber).subscribe((res: any) => {
        console.log('GETPARTYLIST API: ', res);
        if (res.status === 'SUCCESS') {
          console.log('partynames:', this.dataService.partyList);
          if (res.getPartyList && res.getPartyList.length > 0) {
            this.partyList = res.getPartyList.map((item: any) => ({
              partyname: item.partyname,
              phonenumber: item.phonenumber,
              billingaddress: item.billingaddress,
              shipppingaddress: item.shipppingaddress,
              creditlimit: item.creditlimit,
              topayparty: item.topayparty,
              toreceivefromparty: item.toreceivefromparty,
            }));
          }
          if(this.partyList.length > 0){
            this.partyName = this.partyList[0].partyname
            this.GetPartyDetailsData(this.partyName);
          }
          console.log('success');
        }
      });
  }

  selectTab(tab: string) {
    // this.partyHomePageSelectedTab = tab;
    this.dataService.partyHomePageSelectedTab = tab;
    if (this.dataService.partyHomePageSelectedTab === 'party') {
      this.getPartyListData();
    } else if (this.dataService.partyHomePageSelectedTab === 'group') {
      this.ispartygrouplistresponse = true;
      this.api
        .GetPartyGroup(this.registeredMobileNumber).subscribe((response: any) => {
          if (response.status == 'SUCCESS') {
            this.selectedGroup = response.getPartyGroupList[0].partygroup
            this.dataService.partyGroupListResponse =
              response.getPartyGroupList;
            console.log('GET PARTY GROUP SUCCESS', response);
          } else {
            console.log('PARTYGROUP FAILED');
          }
        });
    }
  }

  openAddPartyModal(partyName: any) {
    if (partyName !== '' && !isNaN(this.registeredMobileNumber)) {
      this.api.getPartyDetails(this.registeredMobileNumber, partyName).subscribe({
        next: (res) => {
          if (res.status === 'SUCCESS') {
            this.selectedParty = partyName; 
            this.dataService.isPartyUpdate = true;
            this.dataService.oldPartyName = partyName;
            console.log('Party Details:', res.partyList[0]);
            this.cdr.detectChanges(); // Manually trigger change detection
            const dialogRef = this.dialog.open(AddPartyComponent, {
              width: '60%',
              height: '99%',
              data: { partyDetails: res.partyList[0], partyName, status: 'SUCCESS' },
            });
  
            dialogRef.afterClosed().subscribe(result => {
              this.selectTab('party');
            });
          } else {
            this.dataService.isPartyUpdate = false;
            this.cdr.detectChanges(); // Manually trigger change detection
            console.log('Failed to retrieve party details');
          }
        },
        error: (err) => {
          console.log('Error retrieving party details', err);
        },
      });
    } else {
      this.dataService.isPartyUpdate = false;
      this.cdr.detectChanges(); // Manually trigger change detection
      console.log('Opening dialog with empty data');
      const dialogRef = this.dialog.open(AddPartyComponent, {
        width: '60%',
        height: '99%',
        data: { partyDetails: null, partyName: '' },
      });
  
      dialogRef.afterClosed().subscribe(result => {
        this.selectTab('party');
      });
    }
  }

  openAddPartyGroupModal(groupname: any) {
    if (groupname !== '' && !isNaN(this.registeredMobileNumber)) {
      this.api
        .GetPartyByGroup(this.registeredMobileNumber, groupname)
        .subscribe({
          next: (res) => {
            if (res != null) {
              this.selectedGroup = groupname;
              this.dataService.isGroupUpdate = true;
              this.dataService.oldPartyGroupName = groupname;
              const dialogRef = this.dialog.open(AddPartyGroupComponent, {
                width: '40%',
                height: '35%',
                data: { groupDetails: groupname }, // Pass the data here
              });
              dialogRef.afterClosed().subscribe((result) => {
                this.selectTab('group');
              });
            } else {
              this.dataService.isGroupUpdate = false;
              console.log('Failed to retrieve party group details');
            }
          },
          error: () => {
            console.log('Error retrieving party group details');
          },
        });
    } else {
      this.dataService.isGroupUpdate = false;
      const dialogRef = this.dialog.open(AddPartyGroupComponent, {
        width: '40%',
        height: '35%',
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.selectTab('group');
      });
    }
  }

  GetPartyDetailsData(partyName: any) {
    console.log("partyname ca=haiye: ", partyName)
    console.log('onclick: ', partyName);
    this.api.getPartyTransactions(this.registeredMobileNumber, partyName).subscribe((response: any) => {
      if (response.status == 'SUCCESS') {
        this.selectedParty = partyName; 
        this.dataService.transactionDetailsResponse = response.partyTransactionsList;
        this.gst = response.gst;
        this.emailid = response.emailid;
        this.phonenumber = response.phonenumber;
        this.billingaddress = response.billingaddress;
        this.creditlimit = response.creditlimit;
        this.partyName = partyName
        console.log('TRANSACTION SUCCESS');
      } else {
        console.log('TRANSACTION FAILED');
      }});
  }

  GetPartyByGroupData(groupname: any) {
    console.log('onclick: ', groupname);
    this.groupname = groupname;
    this.api
      .GetPartyByGroup(this.registeredMobileNumber, groupname).subscribe({
        next: (res) => {
          console.log('GETPARTYGROUPLIST API: ', res);
          if (res) {
            this.selectedGroup = groupname;
            this.dataService.partyByGroupResponse = res.getPartyList;
            this.selectedGroup = groupname
            console.log('successs');
          } else {
            console.log('failed');
          }
        },
        error: () => {
          console.log('errorrrr');
        },
      });
  }

  partyHandleClick(event: MouseEvent, partyName: any) {
    this.clicks.push(event);
    setTimeout(() => {
      if (this.clicks.length === 1) {
        // Single click detected
        this.GetPartyDetailsData(partyName);
        this.selectedParty = partyName; // Set selected party
      } else if (this.clicks.length === 2) {
        // Double click detected
        this.openAddPartyModal(partyName);
        this.selectedParty = partyName; 
      }
      this.clicks = [];
    }, 250);
  }

  groupHandleClick(event: MouseEvent, partyGroupName: any) {
    this.clicks.push(event);

    setTimeout(() => {
      if (this.clicks.length === 1) {
        // Single click detected
        this.GetPartyByGroupData(partyGroupName);
        // this.selectedGroup === partyGroupName;
      } else if (this.clicks.length === 2) {
        // Double click detected
        this.openAddPartyGroupModal(partyGroupName);
        // this.selectedGroup === partyGroupName;
      }
      this.clicks = [];
    }, 250);
  }

  isSelectedParty(partyName: any): boolean {
    return this.selectedParty === partyName;
  }
  
  isSelectedGroup(groupName: any): boolean {
    return this.selectedGroup === groupName;
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
