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
  registeredPhoneNumber: any;
  selectedTab: any = null;
  destroy$: Subject<boolean> = new Subject<boolean>();

  tabs = [
    {
      name: 'Business Info',
      icon: 'https://img.icons8.com/ios-filled/50/000000/business.png',
      action: () => this.openBusinessInfoModal()
    },
    { name: 'Home', link: '/dashboard', icon: 'https://img.icons8.com/ios-filled/50/000000/home.png', class: 'icon-white' },
    { name: 'Parties', link: '/party-homepage', icon: 'https://img.icons8.com/ios-filled/50/000000/teamwork.png' },
    { name: 'Items', link: '/item-homepage', icon: 'https://img.icons8.com/ios-filled/50/000000/product.png' },
    {
      name: 'Sale',
      icon: 'https://img.icons8.com/ios-filled/50/000000/sale.png',
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
      icon: 'https://img.icons8.com/ios-filled/50/000000/purchase-order.png',
      subTabs: [
        { name: 'Purchase Bills', link: '/Purchase-Bills' },
        { name: 'Payment Out', link: '/Payment-Out' },
        { name: 'Advance Out', link: '/Advance-Out' },
        { name: 'Purchase Order', link: '/Purchase-Order' },
        { name: 'Purchase Return/Dr. Note', link: '/Purchase-Return' }
      ],
      isOpen: false
    },
    { name: 'Grow Your Business', link: '/growyourbusiness', icon: 'https://img.icons8.com/ios-filled/50/000000/business.png' },
    { name: 'Banks', link: '/banks-homepage', icon: 'https://img.icons8.com/ios-filled/50/000000/bank.png' },
    { name: 'Reports', link: '/reports', icon: 'https://img.icons8.com/ios-filled/50/000000/report-card.png' },
    { name: 'Sync, Share & Backups', link: '/syncshare', icon: 'https://img.icons8.com/ios-filled/50/000000/synchronize.png' },
    { name: 'Apply For Loan', link: '/applyloan', icon: 'https://img.icons8.com/ios-filled/50/000000/money.png' },
    { name: 'Other Products', link: '/otherproducts', icon: 'https://img.icons8.com/ios-filled/50/000000/product.png' },
    {
      name: 'Utilities',
      icon: 'https://img.icons8.com/ios-filled/50/000000/wrench.png',
      subTabs: [{ name: 'Import Items', link: '/import-items' }],
      isOpen: false
    },
    { name: 'Plans', link: '/plans', icon: 'https://img.icons8.com/ios-filled/50/000000/calendar.png' }
  ];

  constructor(public dialog: MatDialog, private api: ApiService, public dataService: DataService) { }

  ngOnInit() {
    this.registeredPhoneNumber = parseInt(JSON.parse(localStorage.getItem('phonenumber') as string));
  }


  toggleSubMenu(tab: any) {
    this.selectedTab = tab;
    this.dataService.checkPlanExpiry();
    tab.isOpen = !tab.isOpen;
  }

  selectSubTab(subTab: any) {
    this.selectedTab = subTab;
    this.dataService.checkPlanExpiry();
  }

  getPartyListData() {
    this.dataService.partyHomePageSelectedTab = 'party';
    this.api.getPartyList(this.registeredPhoneNumber).subscribe((res: any) => {
      if (res.status === "SUCCESS") {
        this.dataService.partyList = res.getPartyList.map((item: any) => ({
          partyname: item.partyname,
          phonenumber: item.phonenumber,
          billingaddress: item.billingaddress,
          shipppingaddress: item.shipppingaddress,
          creditlimit: item.creditlimit,
          topayparty: item.topayparty,
          toreceivefromparty: item.toreceivefromparty,
        }));
      }
    });

    this.api.GetPartyGroup(this.registeredPhoneNumber).subscribe({
      next: (response) => {
        if (response.status === "SUCCESS") {
          this.dataService.partyGroupListResponse = response.getPartyGroupList;
        }
      },
      error: () => console.log("PARTY GROUP ERROR")
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddPartyComponent, {
      width: '1000px',
      maxHeight: '1000px'
    });

    dialogRef.afterClosed().subscribe(() => console.log('The dialog was closed'));
  }

  openBusinessInfoModal() {
    const dialogRef = this.dialog.open(BusinessInformationComponent, {
      width: '50%',
      height: '70%',
    });

    dialogRef.afterClosed().subscribe(() => { });
  }

  getItemListData() {
    this.dataService.itemHomePageSelectedTab = 'product';
    this.api.GetItemList(this.registeredPhoneNumber).subscribe({
      next: (res) => {
        if (res.status === "SUCCESS") {
          this.dataService.itemListResponse = res.getItemList;
        }
      },
      error: () => console.log("GETITEMLIST error")
    });

    this.api.GetCategory(this.registeredPhoneNumber).subscribe({
      next: (response) => {
        if (response.status === "SUCCESS") {
          this.dataService.categoryListResponse = response.getCateogoryList;
        }
      },
      error: () => console.log("CATEGORY ERROR")
    });
  }

  redirecttobanks() {
    const dialogRef = this.dialog.open(BanksComponent, {
      width: '900px',
      height: '700px',
    });

    dialogRef.afterClosed().subscribe(() => console.log('The dialog was closed'));
  }

}
