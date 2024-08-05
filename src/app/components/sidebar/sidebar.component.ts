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

  tabs = [
    {
      name: 'Home',
      link: '/',
      icon: 'https://w7.pngwing.com/pngs/848/762/png-transparent-computer-icons-home-house-home-angle-building-rectangle-thumbnail.png',
    },
    {
      name: 'Business Information',
      icon: 'https://w7.pngwing.com/pngs/848/762/png-transparent-computer-icons-home-house-home-angle-building-rectangle-thumbnail.png',
      action: () => this.openBusinessInfoModal()
    },
    {
      name: 'Parties',
      link: '/party-homepage',
      icon: 'https://w7.pngwing.com/pngs/848/762/png-transparent-computer-icons-home-house-home-angle-building-rectangle-thumbnail.png',
      action: () => this.getPartyListData()
    },
    {
      name: 'Items',
      link: '/item-homepage',
      icon: 'https://w7.pngwing.com/pngs/848/762/png-transparent-computer-icons-home-house-home-angle-building-rectangle-thumbnail.png',
      action: () => this.getItemListData()
    },
    {
      name: 'Sale',
      // link: '/Sale',
      icon: 'https://w7.pngwing.com/pngs/848/762/png-transparent-computer-icons-home-house-home-angle-building-rectangle-thumbnail.png',
      subTabs: [
        { name: 'Sale Invoices', link: '/Sale/sale-invoice' },
        { name: 'Estimate/ Quotation', link: '/Sale/estimate-quotation' },
        { name: 'Payment In', link: '/Sale/payment-in' },
        { name: 'Sale Order', link: '/Sale/sale-order' },
        { name: 'Delivery Challan', link: '/Sale/delivery-challan' },
        { name: 'Sale Return/ Cr. Note', link: '/Sale/sale-return' }
      ],
      isOpen: false
    },
    {
      name: 'Purchase',
      // link: '/purchase',
      icon: 'https://w7.pngwing.com/pngs/848/762/png-transparent-computer-icons-home-house-home-angle-building-rectangle-thumbnail.png',
      subTabs: [
        { name: 'Purchase Bills', link: '/Purchase/purchase-bills' },
        { name: 'Payment Out', link: '/Purchase/payment-out' },
        { name: 'Purchase Order', link: '/Purchase/purchase-order' },
        { name: 'Purchase Return/ Dr. Note', link: '/Purchase/purchase-return' },
      ],
      isOpen: false
    }
  ];

  toggleSubMenu(tab: any) {
    tab.isOpen = !tab.isOpen;
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
}
