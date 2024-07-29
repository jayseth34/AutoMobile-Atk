import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyComponent } from '../add-party/add-party.component';
import { ApiService } from 'src/app/services/api.service';
import { takeUntil, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { BusinessInformationComponent } from '../business-information/business-information.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  // totalGroupCount: any;
  // totalGroupCountSum: any;
  registeredPhoneNumber:any;

  constructor(public dialog: MatDialog, private api: ApiService, public dataService: DataService) { }
 
  ngOnInit(){
    this.registeredPhoneNumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
  }

  getPartyListData() {
    this.dataService.partyHomePageSelectedTab = 'party';
    this.api.getPartyList(this.registeredPhoneNumber).subscribe((res:any) => {
      console.log("GETPARTYLIST API: ",res);
      if(res.status == "SUCCESS") {
        console.log("partynames:",this.dataService.partyList)
        let amount: any;
        this.dataService.partyList = res.getPartyList.map((item: any) => ({
          partyname: item.partyname,
          phonenumber: item.phonenumber,
          billingaddress: item.billingaddress,
          shipppingaddress: item.shipppingaddress,
          creditlimit: item.creditlimit,
          topayparty: item.topayparty,
          toreceivefromparty: item.toreceivefromparty,
        }))
        console.log("successs")
      }
      else {
        console.log("failed")
      }
  })
    this.api.GetPartyGroup(this.registeredPhoneNumber).subscribe({
      next:(response) => {
        if(response.status == "SUCCESS") {
          this.dataService.partyGroupListResponse = response.getPartyGroupList
          // this.calculateSummary(response.getPartyGroupList);
          console.log("GET PARTY GROUP SUCCESS", response)
        }
        else{
          console.log("PARTYGROUP FAILED")
        }
      },
      error:() => {
        console.log("PARTY GROUP ERROR")
      }
    })
  }

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


  gotopartypage(){
    window.location.href = 'http://localhost:4201/party-homepage';
  }

  openBusinessInfoModal() {
    const dialogRef = this.dialog.open(BusinessInformationComponent, {
      width: '50%',
      height: '70%', 
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getItemListData() {
    // debugger
    this.dataService.itemHomePageSelectedTab = 'product';
    this.api.GetItemList(this.registeredPhoneNumber).subscribe({
      next:(res) => {
        console.log("GETITEMLIST API: ",res);
        if(res) {
          this.dataService.itemListResponse = res.getItemList
          console.log("ITEMMM: ", this.dataService.itemListResponse[1].saleprice)
          console.log("GETITEMLIST successs")
        }
        else {
          console.log("GETITEMLIST failed")
        }
      },
      error:() => {
        console.log("GETITEMLIST errorrrr")
      }
    })
    this.api.GetCategory(this.registeredPhoneNumber).subscribe({
      next:(response) => {
        if(response.status == "SUCCESS") {
          this.dataService.categoryListResponse = response.getCateogoryList
          console.log("CATEGORRYYY: ", this.dataService.categoryListResponse[1].category)
          console.log("GET CATEGORY SUCCESS", response)
        }
        else{
          console.log("CATEGORY FAILED")
        }
      },
      error:() => {
        console.log("CATEGORY ERROR")
      }
    })
  }

  // calculateSummary(partyGroups: any[]): void {
  //   debugger
  //   partyGroups.forEach(group => {
  //     this.totalGroupCount = this.totalGroupCount + 1;
  //     this.totalGroupCountSum = this.totalGroupCountSum + group.partygroupcount;
  //     console.log("GROUP SUMMAYR:", this.totalGroupCount,  this.totalGroupCountSum)
  //   });
  // }

}
