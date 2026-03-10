import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartyComponent } from '../add-party/add-party.component';
import { ApiService } from 'src/app/services/api.service';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { BusinessInformationComponent } from '../business-information/business-information.component';
import { BanksComponent } from '../banks/banks.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  registeredPhoneNumber: any;
  selectedTab: any = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  private readonly defaultBusinessTabName = 'Business Info';
  @Output() itemSelected = new EventEmitter<void>();

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
    { name: 'Plans', link: '/plans', icon: 'https://img.icons8.com/ios-filled/50/000000/calendar.png' },
    {
      name: 'Logout',
      icon: 'https://img.icons8.com/ios-filled/50/000000/logout-rounded-left.png',
      action: () => this.logout()
    }
  ];

  constructor(public dialog: MatDialog, private api: ApiService, public dataService: DataService, private router: Router) { }

  private getDialogConfig(width: string, height?: string, data?: any) {
    const isMobile = window.innerWidth <= 767.98;
    return {
      width: isMobile ? '96vw' : width,
      height: isMobile ? 'auto' : height,
      maxWidth: isMobile ? '96vw' : '95vw',
      maxHeight: isMobile ? '92vh' : '95vh',
      panelClass: isMobile ? 'mobile-app-dialog' : '',
      data
    };
  }

  ngOnInit() {
    this.registeredPhoneNumber = parseInt(JSON.parse(localStorage.getItem('phonenumber') as string));
    this.loadBusinessTabName();
  }


  onTabClick(tab: any, event: Event) {
    this.selectedTab = tab;
    this.dataService.checkPlanExpiry();

    if (tab.subTabs) {
      event.preventDefault();
      tab.isOpen = !tab.isOpen;
      return;
    }

    if (tab.action) {
      if (!tab.link) {
        event.preventDefault();
      }
      tab.action();
    }

    this.itemSelected.emit();
  }

  onSubTabClick(subTab: any) {
    this.selectedTab = subTab;
    this.dataService.checkPlanExpiry();
    this.itemSelected.emit();
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
    const dialogRef = this.dialog.open(AddPartyComponent, this.getDialogConfig('1000px', '1000px'));

    dialogRef.afterClosed().subscribe(() => console.log('The dialog was closed'));
  }

  openBusinessInfoModal() {
    const dialogRef = this.dialog.open(BusinessInformationComponent, this.getDialogConfig('50%', '70%'));

    dialogRef.afterClosed().subscribe(() => {
      this.loadBusinessTabName();
    });
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
    const dialogRef = this.dialog.open(BanksComponent, this.getDialogConfig('900px', '700px'));

    dialogRef.afterClosed().subscribe(() => console.log('The dialog was closed'));
  }

  private loadBusinessTabName(): void {
    if (!this.registeredPhoneNumber) {
      this.setBusinessTabName(this.defaultBusinessTabName);
      return;
    }

    this.api.getBusinessInfo(this.registeredPhoneNumber).subscribe({
      next: (res: any) => {
        const businessName = res?.businessInfo?.businessName?.trim();
        this.setBusinessTabName(businessName || this.defaultBusinessTabName);
      },
      error: () => {
        this.setBusinessTabName(this.defaultBusinessTabName);
      }
    });
  }

  private setBusinessTabName(name: string): void {
    // Business tab is always the first item in the sidebar.
    if (this.tabs?.length) {
      this.tabs[0].name = name;
    }
  }

  async logout(): Promise<void> {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'This will end your session on this device.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    this.dialog.closeAll();
    this.releaseScrollLockIfAny();
    localStorage.clear();
    this.dataService.isLogin = true;

    // Close sidebar on mobile after logout.
    this.itemSelected.emit();

    this.router.navigateByUrl('/login');
  }

  private releaseScrollLockIfAny(): void {
    const body = document.body;
    if (!body.classList.contains('cdk-global-scrollblock')) return;

    body.classList.remove('cdk-global-scrollblock');
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.width = '';
    body.style.overflow = '';
  }

}

