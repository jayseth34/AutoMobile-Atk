import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AddPartyComponent } from "../add-party/add-party.component";
import { DataService } from "src/app/services/data.service";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { AddPartyGroupComponent } from "../add-party-group/add-party-group.component";
import { Subject, takeUntil } from "rxjs";
import { ApiService } from "src/app/services/api.service";
import { fromEvent, Subscription } from "rxjs";
import { buffer, debounceTime, filter, map } from "rxjs/operators";
import { Party } from "src/app/models";
import { CommonService } from "src/app/services/common.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

@Component({
  selector: "app-party-homepage",
  templateUrl: "./party-homepage.component.html",
  styleUrls: ["./party-homepage.component.css"],
})
export class PartyHomepageComponent {
  totalPartyGroups: any;
  totalPartyGroupCount: any;
  selectedGroup: any = "";
  selectedParty: any = "";
  searchParty: string = "";
  searchGroup: string = "";
  partyName: any = "";
  amount: any = "";
  groupname: any = "";
  registeredMobileNumber: any = "";
  clickSubscription: Subscription;
  clicks: any[] = [];
  partyList: Party[] = [];
  ispartygrouplistresponse: boolean = false;
  phonenumber: any = 0;
  billingaddress: any = "";
  emailid: any = "";
  gst: any = "";
  creditlimit: any = 0;
  selectedTabIndex: number = 0;
  filteredPartyList: any[] = [];
  filteredGroupList: any[] = [];
  

  @ViewChild("app-add-party") addPartyModal: AddPartyComponent;
  searchTerm: any;
  searchTermTransactions: any;
  filteredTransactions: any;

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    private api: ApiService,
    public cs: CommonService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

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
    // Listen to click events on the document
    this.selectedTabIndex =
      this.dataService.partyHomePageSelectedTab === "group" ? 1 : 0;
    this.registeredMobileNumber = parseInt(
      JSON.parse(localStorage.getItem("phonenumber") as string),
    );
    this.clickSubscription = fromEvent(document, "click")
      .pipe(
        buffer(fromEvent(document, "click").pipe(debounceTime(250))), // Collect clicks within 250ms
        map((clicks) => clicks.length), // Count the number of clicks
        filter((clickCount) => clickCount > 0), // Ignore if no clicks
      )
      .subscribe((clickCount) => {
        if (clickCount === 1) {
          console.log("Single click");
        } else if (clickCount === 2) {
          console.log("Double click");
        }
      });

    this.selectTab(0);
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  getPartyListData() {
    this.api.getPartyList(this.registeredMobileNumber).subscribe((res: any) => {
      console.log("GETPARTYLIST API: ", res);
      if (res.status === "SUCCESS") {
        console.log("partynames:", this.dataService.partyList);
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
        this.filteredPartyList = this.partyList;
        if (this.partyList.length > 0) {
          this.partyName = this.partyList[0].partyname;
          this.GetPartyDetailsData(this.partyName);
        }
        console.log("success");
      }
    });
  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
    this.dataService.partyHomePageSelectedTab = index === 1 ? "group" : "party";
    if (this.dataService.partyHomePageSelectedTab === "party") {
      this.getPartyListData();
    } else if (this.dataService.partyHomePageSelectedTab === "group") {
      this.ispartygrouplistresponse = true;
      this.api
        .GetPartyGroup(this.registeredMobileNumber)
        .subscribe((response: any) => {
          if (
            response.status == "SUCCESS" &&
            response.getPartyGroupList.length > 0
          ) {
            this.totalPartyGroups = response.getPartyGroupList.length;
            this.totalPartyGroupCount = response.getPartyGroupList.reduce(
              (
                sum: number,
                group: { partygroup: string; partygroupcount: number },
              ) => {
                return sum + group.partygroupcount;
              },
              0,
            );
            this.selectedGroup = response.getPartyGroupList[0].partygroup;
            this.dataService.partyGroupListResponse =
              response.getPartyGroupList;
            this.filteredGroupList = this.dataService.partyGroupListResponse;
            this.GetPartyByGroupData(response.getPartyGroupList[0].partygroup);
          } else {
            console.log("PARTYGROUP FAILED");
          }
        });
    }
  }

  openAddPartyModal(partyName: any) {
    if (partyName !== "" && !isNaN(this.registeredMobileNumber)) {
      this.api
        .getPartyDetails(this.registeredMobileNumber, partyName)
        .subscribe({
          next: (res) => {
            if (res.status === "SUCCESS") {
              this.selectedParty = partyName;
              this.dataService.isPartyUpdate = true;
              this.dataService.oldPartyName = partyName;
              console.log("Party Details:", res.partyList[0]);
              this.cdr.detectChanges(); // Manually trigger change detection
              const dialogRef = this.dialog.open(
                AddPartyComponent,
                this.getDialogConfig("60%", "99%", {
                  partyDetails: res.partyList[0],
                  partyName,
                  status: "SUCCESS",
                })
              );

              dialogRef.afterClosed().subscribe((result) => {
                this.selectTab(0);
              });
            } else {
              this.dataService.isPartyUpdate = false;
              this.cdr.detectChanges(); // Manually trigger change detection
              console.log("Failed to retrieve party details");
            }
          },
          error: (err) => {
            console.log("Error retrieving party details", err);
          },
        });
    } else {
      this.dataService.isPartyUpdate = false;
      this.cdr.detectChanges(); // Manually trigger change detection
      console.log("Opening dialog with empty data");
      const dialogRef = this.dialog.open(
        AddPartyComponent,
        this.getDialogConfig("60%", "99%", { partyDetails: null, partyName: "" })
      );

      dialogRef.afterClosed().subscribe((result) => {
        this.selectTab(0);
      });
    }
  }

  openAddPartyGroupModal(groupname: any) {
    if (groupname !== "" && !isNaN(this.registeredMobileNumber)) {
      this.api
        .GetPartyByGroup(this.registeredMobileNumber, groupname)
        .subscribe({
          next: (res) => {
            if (res != null) {
              this.selectedGroup = groupname;
              this.dataService.isGroupUpdate = true;
              this.dataService.oldPartyGroupName = groupname;
              const dialogRef = this.dialog.open(
                AddPartyGroupComponent,
                this.getDialogConfig("40%", "35%", { groupDetails: groupname })
              );
              dialogRef.afterClosed().subscribe((result) => {
                this.selectTab(1);
              });
            } else {
              this.dataService.isGroupUpdate = false;
              console.log("Failed to retrieve party group details");
            }
          },
          error: () => {
            console.log("Error retrieving party group details");
          },
        });
    } else {
      this.dataService.isGroupUpdate = false;
      const dialogRef = this.dialog.open(
        AddPartyGroupComponent,
        this.getDialogConfig("40%", "35%")
      );
      dialogRef.afterClosed().subscribe((result) => {
        this.selectTab(1);
      });
    }
  }

  GetPartyDetailsData(partyName: any) {
    console.log("partyname ca=haiye: ", partyName);
    console.log("onclick: ", partyName);
    this.api
      .getPartyTransactions(this.registeredMobileNumber, partyName)
      .subscribe((response: any) => {
        if (response.status == "SUCCESS") {
          this.selectedParty = partyName;
          this.dataService.transactionDetailsResponse =
            response.partyTransactionsList;
            this.filteredTransactions = response.partyTransactionsList;
          this.gst = response.gst;
          this.emailid = response.emailid;
          this.phonenumber = response.phonenumber;
          this.billingaddress = response.billingaddress;
          this.creditlimit = response.creditlimit;
          this.partyName = partyName;
          console.log("TRANSACTION SUCCESS");
        } else {
          console.log("TRANSACTION FAILED");
        }
      });
  }

  GetPartyByGroupData(groupname: any) {
    console.log("onclick: ", groupname);
    this.groupname = groupname;
    this.api
      .GetPartyByGroup(this.registeredMobileNumber, groupname)
      .subscribe((res: any) => {
        console.log("GETPARTYGROUPLIST API: ", res);
        if (res.status == "SUCCESS") {
          this.dataService.partyByGroupResponse = res.getPartyList;
          this.filteredGroupList = this.dataService.partyGroupListResponse;
          this.selectedGroup = groupname;
          console.log("successs");
        } else {
          this.selectedGroup = groupname;
        }
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

  onSearch() {
    if (this.selectedTabIndex === 0) {
      this.partyList = this.filteredPartyList.filter((party) =>
        party.partyname.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    } else {
      this.dataService.partyGroupListResponse = this.filteredGroupList.filter(
        (group) =>
          group.partygroup
            .toLowerCase()
            .includes(this.searchGroup.toLowerCase()),
      );
    }
  }

  handleDoublePartyItemClick(row: any) {
    console.log("Clicked: ", row);

    const transactionMap: any = {
        'SALE': 'Sale',
        'SALE ORDER': 'Sale-Order',
        'ESTIMATE QUOTATION': 'Estimate-Quotation',
        'SALE RETURN': 'Sale-Return',
        'DELIVERY CHALLAN': 'Delivery-Challan',
        'PURCHASE': 'Purchase',
        'PURCHASE ORDER': 'Purchase-Order',
        'PURCHASE RETURN': 'Purchase-Return',
        'PAYMENT IN': 'PAYMENT IN',
        'PAYMENT OUT': 'PAYMENT OUT',
        'ADVANCE IN': 'ADVANCE IN',
        'ADVANCE OUT': 'ADVANCE OUT'
    };

    const typeOfPay = transactionMap[row.typeofpay];

    if (!typeOfPay) {
        Swal.fire({text: "Cannot edit this transaction type"})
        return;
    }

    if (['PAYMENT IN', 'PAYMENT OUT', 'ADVANCE IN', 'ADVANCE OUT'].includes(row.typeofpay)) {
        // Set data for Payment or Advance
        this.dataService.invoicenumber = row.invoicenumber;
        this.dataService.isview = true;
        this.dataService.typeofpay = row.typeofpay;
        return this.router.navigateByUrl('/pin');
    }

    return this.router.navigate([`/${typeOfPay}/edit`, row.invoicenumber]);
}

handleEdit(transaction: any) {
  console.log("Edit clicked for: ", transaction);
  this.handleDoublePartyItemClick(transaction);
}

applyFilter() {
  this.filteredTransactions = this.dataService.transactionDetailsResponse.filter((transaction:any) =>
      transaction.typeofpay.toLowerCase().includes(this.searchTermTransactions.toLowerCase()) ||
      transaction.invoicenumber.toString().includes(this.searchTermTransactions) ||
      transaction.total.toString().includes(this.searchTermTransactions) ||
      transaction.balance.toString().includes(this.searchTermTransactions) ||
      transaction.paymentstatus.toLowerCase().includes(this.searchTermTransactions.toLowerCase())
  );
}

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.clickSubscription.unsubscribe();
  }
}

