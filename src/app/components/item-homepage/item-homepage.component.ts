import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  ViewChild,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { AddItemComponent } from "../add-item/add-item.component";
import { DataService } from "src/app/services/data.service";
import { ApiService } from "src/app/services/api.service";
import { Subject, Subscription, takeUntil, fromEvent } from "rxjs";
import { buffer, debounceTime, filter, map } from "rxjs/operators";
import { AddItemCategoryComponent } from "../add-item-category/add-item-category.component";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { Router } from "@angular/router";

@Component({
  selector: "app-item-homepage",
  templateUrl: "./item-homepage.component.html",
  styleUrls: ["./item-homepage.component.css"],
})
export class ItemHomepageComponent {
  selectedCategory: any = "";
  selectedItem: any = "";
  clickSubscription: Subscription;
  clicks: any[] = [];
  registeredMobileNumber: any;
  itemlist: any[] = [];
  itemName: any;
  saleprice: any;
  purchaseprice: any;
  minimumwholesalequantity: any;
  minimumstocktomaintain: any;
  categoryName: any;
  itemHomePageSelectedTabIndex: number = 0;
  filteredItemList: any[] = [];
  filteredCategoryList: any[] = [];
  searchTerm: any;
  searchCategory: any;

  @ViewChild("app-add-item") addItemModal: AddItemComponent;
  categorycount: any;

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.registeredMobileNumber = parseInt(
      JSON.parse(localStorage.getItem("phonenumber") as string),
    );
    // Listen to click events on the document
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
    this.selectTab("product", 0);
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  openAddItemModal(itemName: any) {
    if (!isNaN(this.registeredMobileNumber) && itemName != "") {
      this.api.GetItemDetails(this.registeredMobileNumber, itemName).subscribe({
        next: (res) => {
          if (res.status === "SUCCESS") {
            this.selectedItem = itemName;
            this.dataService.isItemUpdate = true;
            this.dataService.oldItemName = itemName;
            this.cdr.detectChanges(); // Manually trigger change detection
            const dialogRef = this.dialog.open(AddItemComponent, {
              width: "60%",
              height: "99%",
              data: {
                itemDetails: res.itemList[0],
                itemName,
                status: "SUCCESS",
              }, // Pass the data here
            });
            dialogRef.afterClosed().subscribe((result) => {
              this.selectTab("product", 0);
            });
          } else {
            this.dataService.isPartyUpdate = false;
            console.log("Failed to retrieve item details");
          }
        },
        error: () => {
          console.log("Error retrieving item details");
        },
      });
    } else {
      this.dataService.isItemUpdate = false;
      this.cdr.detectChanges(); // Manually trigger change detection
      const dialogRef = this.dialog.open(AddItemComponent, {
        width: "60%",
        height: "99%",
        data: { itemDetails: null, itemName: "" },
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.selectTab("product", 0);
      });
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    const index = event.index;
    if (index == 0) {
      this.selectTab("product", index);
    } else if (index == 1) {
      this.selectTab("category", index);
    }
  }

  selectTab(tab: string, index: number) {
    this.dataService.itemHomePageSelectedTab = tab;
    this.itemHomePageSelectedTabIndex = index;
    if (this.dataService.itemHomePageSelectedTab == "product") {
      this.getitemlistdata();
    } else if (this.dataService.itemHomePageSelectedTab == "category") {
      this.api
        .GetCategory(this.registeredMobileNumber)
        .subscribe((response: any) => {
          if (
            response.status == "SUCCESS" &&
            response.getCateogoryList.length > 0
          ) {
            this.selectedCategory = response.getCateogoryList[0].category;
            this.categorycount = response.getCateogoryList[0].categorycount;
            this.dataService.categoryListResponse = response.getCateogoryList;
            this.filteredCategoryList = this.dataService.categoryListResponse;
            this.GetItemByCategoryData(response.getCategoryList[0].category);
          } else {
            console.log("CATEGORY FAILED");
          }
        });
    }
  }

  openAddItemCategoryModal(categoryname: any) {
    if (categoryname !== "" && !isNaN(this.registeredMobileNumber)) {
      this.api
        .GetItemByCategory(this.registeredMobileNumber, categoryname)
        .subscribe({
          next: (res) => {
            if (res.status === "SUCCESS") {
              this.selectedCategory = categoryname;
              this.dataService.isCategoryUpdate = true;
              this.dataService.oldCategoryName = categoryname;
              const dialogRef = this.dialog.open(AddItemCategoryComponent, {
                width: "40%",
                height: "35%",
                data: { categorynameDetails: categoryname }, // Pass the data here
              });
              dialogRef.afterClosed().subscribe((result) => {
                this.selectTab("category", 1);
              });
            } else {
              this.dataService.isCategoryUpdate = false;
              console.log("Failed to retrieve party group details");
            }
          },
          error: () => {
            console.log("Error retrieving party group details");
          },
        });
    } else {
      this.dataService.isCategoryUpdate = false;
      const dialogRef = this.dialog.open(AddItemCategoryComponent, {
        width: "40%",
        height: "35%",
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.selectTab("category", 1);
      });
    }
  }

  GetItemDetailsData(itemname: any) {
    this.api
      .GetItemTransactions(this.registeredMobileNumber, itemname)
      .subscribe((response: any) => {
        if (response.status == "SUCCESS") {
          this.selectedItem = itemname;
          this.dataService.GetItemTransactionsResponse =
            response.itemTransactionsList;
          this.saleprice = response.saleprice;
          this.purchaseprice = response.purchaseprice;
          this.minimumstocktomaintain = 10;
          this.minimumwholesalequantity = 10;
          console.log("ITEMS DATA SUCCESS");
        } else {
          console.log("ITEMS DATA FAILED");
        }
      });
  }

  GetItemByCategoryData(category: any) {
    this.api
      .GetItemByCategory(this.registeredMobileNumber, category)
      .subscribe({
        next: (res) => {
          console.log("GETITEMDETS API: ", res);
          if (res.status == "SUCCESS") {
            this.selectedCategory = category;
            this.dataService.isCategoryUpdate = true;
            this.dataService.GetItemByCategoryResponse = res.getItemList;
            this.filteredCategoryList = this.dataService.partyGroupListResponse;
          } else {
            this.dataService.isCategoryUpdate = false;
            console.log("GETITEMS API failed");
          }
        },
        error: () => {
          console.log("errorrrr");
        },
      });
  }

  productHandleClick(event: MouseEvent, itemName: any) {
    this.clicks.push(event);
    this.itemName = itemName;
    setTimeout(() => {
      if (this.clicks.length === 1) {
        // Single click detected
        this.GetItemDetailsData(itemName);
      } else if (this.clicks.length === 2) {
        // Double click detected
        this.openAddItemModal(itemName);
      }
      this.clicks = [];
    }, 250);
  }

  categoryHandleClick(event: MouseEvent, itemCategoryName: any, count: any) {
    this.categorycount = count;
    this.clicks.push(event);
    this.categoryName = itemCategoryName;
    setTimeout(() => {
      if (this.clicks.length === 1) {
        // Single click detected
        this.GetItemByCategoryData(itemCategoryName);
      } else if (this.clicks.length === 2) {
        // Double click detected
        this.openAddItemCategoryModal(itemCategoryName);
      }
      this.clicks = [];
    }, 250);
  }

  getitemlistdata() {
    this.api.GetItemList(this.registeredMobileNumber).subscribe((res: any) => {
      if (res.status == "SUCCESS") {
        this.selectedItem = res.getItemList[0].itemname;
        if (res.getItemList && res.getItemList.length > 0) {
          this.itemlist = res.getItemList.map((item: any) => ({
            itemname: item.itemname,
            remainingquantity: item.remainingquantity,
          }));
        }
        this.dataService.itemListResponse = res.getItemList;
        if (this.itemlist.length > 0) {
          this.itemName = this.itemlist[0].itemname;
          this.GetItemDetailsData(this.itemName);
        }
        this.filteredItemList = this.itemlist;
      } else {
        console.log("GETITEMLIST failed");
      }
    });
  }

  ngOnDestroy() {
    this.clickSubscription.unsubscribe();
  }

  isSelectedItem(itemName: any): boolean {
    return this.selectedItem === itemName;
  }

  isSelectedCategory(categoryName: any): boolean {
    return this.selectedCategory === categoryName;
  }

  onSearch() {
    if (this.itemHomePageSelectedTabIndex === 0) {
      this.itemlist = this.filteredItemList.filter((item) =>
        item.itemname.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    } else {
      this.dataService.categoryListResponse = this.filteredCategoryList.filter(
        (category) =>
          category.category
            .toLowerCase()
            .includes(this.searchCategory.toLowerCase()),
      );
    }
  }

  handleItemDoubleClick(row: any) {
    console.log("Clicked: ", row);
    let typeOfPay = "";
    switch (row.typeofpay) {
      case "SALE":
        typeOfPay = "Sale";
        break;
      case "SALE ORDER":
        typeOfPay = "Sale-Order";
        break;
      case "ESTIMATE QUATATION":
        typeOfPay = "Estimate-Quatation";
        break;
      case "SALE RETURN":
        typeOfPay = "Sale-Return";
        break;
      case "DELIVERY CHALLAN":
        typeOfPay = "Delivery-Challan";
        break;
      case "PURCHASE":
        typeOfPay = "Purchase";
        break;
      case "PURCHASE ORDER":
        typeOfPay = "Purchase-Order";
        break;
      case "PURCHASE RETURN":
        typeOfPay = "Purchase-Return";
        break;
      default:
        alert("Wrong Transaction Type");
        return;
    }
    this.router.navigate([`/${typeOfPay}/edit`, row.invoicenumber]);
  }
}
