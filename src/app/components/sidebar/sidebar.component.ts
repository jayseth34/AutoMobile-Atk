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

  constructor(public dialog: MatDialog, private api: ApiService, public dataService: DataService) { }
 
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
    // debugger
    this.dataService.partyHomePageSelectedTab = 'party';
    this.api.getPartyList(registeredMobileNumber).pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        console.log("GETPARTYLIST API: ",res);
        if(res.status == "SUCCESS") {
          console.log("partynames:",this.dataService.partyList)
          this.dataService.partyList = res.getPartyList.map((item: { partyname: any; partybalance: any; }) => {
            return {
              partyname: item.partyname,
              partybalance: item.partybalance
            }
          })
          console.log("successs")
          // console.log("HEY : ", res.getPartyList[0].partyname)
          // console.log("HEY : ", res.getPartyList[0].partybalance)
        }
        else {
          console.log("failed")
        }
      },
      error:() => {
        console.log("errorrrr")
      }
    })
    this.api.GetPartyGroup(registeredMobileNumber).pipe(takeUntil(this.destroy$)).subscribe({
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

  openBusinessInfoModal() {
    const dialogRef = this.dialog.open(BusinessInformationComponent, {
      width: '50%',
      height: '70%', 
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getItemListData(registeredMobileNumber: any) {
    // debugger
    this.dataService.itemHomePageSelectedTab = 'product';
    this.api.GetItemList(registeredMobileNumber).pipe(takeUntil(this.destroy$)).subscribe({
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
    this.api.GetCategory(registeredMobileNumber).pipe(takeUntil(this.destroy$)).subscribe({
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
