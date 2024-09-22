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
  totalPartyGroups: any;
  totalPartyGroupCount: any;
  selectedGroup: any = '';
  selectedParty: any = ''; 
  searchParty: string = '';
  searchGroup: string = '';
  partyName: any = '';
  amount: any = '';
  groupname: any = '';
  registeredMobileNumber: any = '';
  clickSubscription: Subscription;
  clicks: any[] = [];
  partyList: Party[] = [];
  ispartygrouplistresponse: boolean = false;
  phonenumber:any = 0;
  billingaddress:any = '';
  emailid:any = '';
  gst:any = '';
  creditlimit:any = 0;
  selectedTabIndex: number = 0;

  @ViewChild('app-add-party') addPartyModal: AddPartyComponent;

  constructor(
    private dialog: MatDialog, public dataService: DataService, private api: ApiService, public cs: CommonService, private cdr: ChangeDetectorRef) {

  }

  ngOnInit() {
    // Listen to click events on the document
    this.selectedTabIndex = this.dataService.partyHomePageSelectedTab === 'group' ? 1 : 0;
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

    this.selectTab(0);
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

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

  selectTab(index: number) {
    this.selectedTabIndex = index;
    this.dataService.partyHomePageSelectedTab = index === 1 ? 'group' : 'party';
    if (this.dataService.partyHomePageSelectedTab === 'party') {
      this.getPartyListData();
    } else if (this.dataService.partyHomePageSelectedTab === 'group') {
      this.ispartygrouplistresponse = true;
      this.api
        .GetPartyGroup(this.registeredMobileNumber).subscribe((response: any) => {
          if (response.status == 'SUCCESS' && response.getPartyGroupList.length > 0) {
            this.totalPartyGroups = response.getPartyGroupList.length;
            this.totalPartyGroupCount = response.getPartyGroupList.reduce((sum: number, group: { partygroup: string, partygroupcount: number }) => {
              return sum + group.partygroupcount;
          }, 0);          
            this.selectedGroup = response.getPartyGroupList[0].partygroup
            this.dataService.partyGroupListResponse = response.getPartyGroupList;
            this.GetPartyByGroupData(response.getPartyGroupList[0].partygroup)
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
              this.selectTab(0);
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
        this.selectTab(0);
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
                this.selectTab(1);
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
        this.selectTab(1);
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
      .GetPartyByGroup(this.registeredMobileNumber, groupname).subscribe((res:any) => {
          console.log('GETPARTYGROUPLIST API: ', res);
          if (res.status == "SUCCESS") {
            this.dataService.partyByGroupResponse = res.getPartyList;
            this.selectedGroup = groupname
            console.log('successs');
          } else {
            this.selectedGroup = groupname
          }
        })
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

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.clickSubscription.unsubscribe();
  }
}
