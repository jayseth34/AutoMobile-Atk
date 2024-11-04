import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyComponent } from '../add-party/add-party.component';
import { ApiService } from 'src/app/services/api.service';
import { takeUntil, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { BusinessInformationComponent } from '../business-information/business-information.component';
import { BanksComponent } from '../banks/banks.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  // totalGroupCount: any;
  // totalGroupCountSum: any;
  registeredPhoneNumber:any;
  selectedTab: any = null; 

  constructor(public dialog: MatDialog, private api: ApiService, public dataService: DataService) { }
 
  ngOnInit(){
    this.registeredPhoneNumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
  }

  tabs = [
    {
      name: 'Home',
      link: '/dashboard',
      icon: 'https://img.icons8.com/ios-filled/50/000000/home.png', // Home icon
    },
    {
      name: 'Parties',
      link: '/party-homepage',
      icon: 'https://img.icons8.com/ios-filled/50/000000/teamwork.png', // Users icon
      // action: () => this.getPartyListData()
    },
    {
      name: 'Items',
      link: '/item-homepage',
      icon: 'https://img.icons8.com/ios-filled/50/000000/product.png', // Items/Products icon
      // action: () => this.getItemListData()
    },
    {
      name: 'Sale',
      icon: 'https://img.icons8.com/ios-filled/50/000000/sale.png', // Sale icon
      subTabs: [
        { name: 'Sale Invoices', link: '/Sale-Invoice' },
        { name: 'Estimate/ Quotation', link: '/Estimate-Quotation' },
        { name: 'Payment In', link: '/Payment-In' },
        { name: 'Advance In', link: '/Advance-In' },
        { name: 'Sale Order', link: '/Sale-Order' },
        { name: 'Delivery Challan', link: '/Delivery-Challan' },
        { name: 'Sale Return/ Cr. Note', link: '/Sale-Return' }
      ],
      isOpen: false
    },
    {
      name: 'Purchase',
      icon: 'https://img.icons8.com/ios-filled/50/000000/purchase-order.png', // Purchase icon
      subTabs: [
        { name: 'Purchase Bills', link: '/Purchase-Bills' },
        { name: 'Payment Out', link: '/Payment-Out' },
        { name: 'Advance Out', link: '/Advance-Out' },
        { name: 'Purchase Order', link: '/Purchase-Order' },
        { name: 'Purchase Return/ Dr. Note', link: '/Purchase-Return' },
      ],
      isOpen: false
    },
    {
      name: 'Grow Your Business',
      link:'/launching-soon',
      icon: 'https://img.icons8.com/ios-filled/50/000000/business.png', // Growth icon
    },
    {
      name: 'Banks',
      link: '/banks-homepage',
      icon: 'https://img.icons8.com/ios-filled/50/000000/bank.png', // Bank icon
    },
    {
      name: 'Reports',
      link:'/launching-soon',
      icon: 'https://img.icons8.com/ios-filled/50/000000/report-card.png', // Report icon
    },
    {
      name: 'Sync, Share & Backups',
      link:'/launching-soon',
      icon: 'https://img.icons8.com/ios-filled/50/000000/synchronize.png', // Sync icon
    },
    {
      name: 'Apply For Loan',
      link:'/launching-soon',
      icon: 'https://img.icons8.com/ios-filled/50/000000/money.png', // Loan icon
    },
    {
      name: 'Other Products',
      link:'/launching-soon',
      icon: 'https://img.icons8.com/ios-filled/50/000000/product.png', // Product icon
    },
    {
      name: 'Utilities',
      link:'/launching-soon',
      icon: 'https://img.icons8.com/ios-filled/50/000000/wrench.png', // Utilities icon
    },
    {
      name: 'Business Info',
      icon: 'https://img.icons8.com/ios-filled/50/000000/business.png', // Business info icon
      action: () => this.openBusinessInfoModal()
    },
    {
      name: 'Plans',
      link: '/plans',
      icon: 'https://img.icons8.com/ios-filled/50/000000/calendar.png', // Plans icon
    }
];

  toggleSubMenu(tab: any) {
    this.selectedTab = tab; 
    this.dataService.checkPlanExpiry()
    tab.isOpen = !tab.isOpen;
  }

  selectSubTab(subTab: any) {
    this.selectedTab = subTab; 
    this.dataService.checkPlanExpiry()
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
    window.location.href = 'http://localhost:4200/party-homepage';
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
        if(res.status == "SUCCESS") {
          this.dataService.itemListResponse = res.getItemList
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

  redirecttobanks(){
    //  window.location.href = 'http://localhost:4201/party-homepage'
    const dialogRef = this.dialog.open(BanksComponent, {
      width: '900px',
      height: '700px',
      data: { }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
