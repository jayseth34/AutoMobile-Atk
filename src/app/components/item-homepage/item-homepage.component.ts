import { ChangeDetectorRef, Component, Inject, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AddItemComponent } from '../add-item/add-item.component';
import { DataService } from 'src/app/services/data.service';
import { ApiService } from 'src/app/services/api.service';
import { Subject, Subscription, takeUntil, fromEvent } from 'rxjs';
import { buffer, debounceTime, filter, map } from 'rxjs/operators';
import { AddItemCategoryComponent } from '../add-item-category/add-item-category.component';

@Component({
  selector: 'app-item-homepage',
  templateUrl: './item-homepage.component.html',
  styleUrls: ['./item-homepage.component.css']
})
export class ItemHomepageComponent {
  selectedCategory: any = '';
  selectedItem: any = ''; 
  clickSubscription: Subscription;
  clicks: any[] = [];
  registeredMobileNumber:any;
  itemlist: any[] = [];
  itemName:any;
  saleprice:any;
  purchaseprice:any;
  minimumwholesalequantity:any;
  minimumstocktomaintain:any;
  categoryName: any;

  @ViewChild('app-add-item') addItemModal: AddItemComponent;

  constructor(private dialog: MatDialog, public dataService: DataService, private api: ApiService, private cdr: ChangeDetectorRef){}

  ngOnInit() {
    this.registeredMobileNumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
    // Listen to click events on the document
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
      this.selectTab('product');
    }


  // rows = [
  //   { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  //   { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  //   { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  //   { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  // ];
  
  destroy$: Subject<boolean> = new Subject<boolean>();

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  openAddItemModal(itemName: any ) {
    if(!isNaN(this.registeredMobileNumber) && itemName!=''){
      this.api.GetItemDetails(this.registeredMobileNumber,itemName).subscribe({
        next: (res) =>{
          if (res.status === "SUCCESS") {
            this.selectedItem = itemName
            this.dataService.isItemUpdate = true;
            this.dataService.oldItemName = itemName
            this.cdr.detectChanges(); // Manually trigger change detection
            const dialogRef = this.dialog.open(AddItemComponent, {
              width: '60%',
              height: '99%',
              data: { itemDetails: res.itemList[0] , itemName, status: 'SUCCESS'} // Pass the data here
            });
            dialogRef.afterClosed().subscribe(result => {
              this.selectTab('product');
            })
          } else {
            this.dataService.isPartyUpdate = false;
            console.log("Failed to retrieve item details");
          }
        },
        error: () => {
          console.log("Error retrieving item details");
        }
      });
    }
    else {
      this.dataService.isItemUpdate = false;
      this.cdr.detectChanges(); // Manually trigger change detection
      const dialogRef = this.dialog.open(AddItemComponent, {
        width: '60%',
        height: '99%', 
        data: { itemDetails: null, itemName: ''},
      });
      dialogRef.afterClosed().subscribe(result => {
        this.selectTab('product');
      });
    }
  }

  selectTab(tab: string) {
    this.dataService.itemHomePageSelectedTab = tab;
    if (this.dataService.itemHomePageSelectedTab == 'product'){
      this.getitemlistdata()
    } else if (this.dataService.itemHomePageSelectedTab == 'category'){
        this.api.GetCategory(this.registeredMobileNumber).subscribe((response:any) => {
          if(response.status == "SUCCESS") {
            this.selectedCategory = response.getCateogoryList[0].category
            this.dataService.categoryListResponse = response.getCateogoryList
            console.log("CATEGORRYYY: ", this.dataService.categoryListResponse[1].category)
            console.log("GET CATEGORY SUCCESS", response)
          }
          else{
            console.log("CATEGORY FAILED")
          }
        })
    }
  }

  openAddItemCategoryModal(categoryname: any) {
    if (categoryname !== '' && !isNaN(this.registeredMobileNumber)){
      this.api.GetItemByCategory(this.registeredMobileNumber,categoryname).subscribe({
        next: (res) => {
          if (res.status === "SUCCESS") {
            this.selectedCategory = categoryname
            this.dataService.isCategoryUpdate = true;
            this.dataService.oldCategoryName = categoryname
            const dialogRef = this.dialog.open(AddItemCategoryComponent, {
              width: '40%',
              height: '35%', 
              data: { categorynameDetails: categoryname } // Pass the data here
            });
            dialogRef.afterClosed().subscribe(result => {
              this.selectTab('category');
            });
          } else {
            this.dataService.isCategoryUpdate = false;
            console.log("Failed to retrieve party group details");
          }
        },
        error: () => {
          console.log("Error retrieving party group details");
        }
      });
    } else {
      this.dataService.isCategoryUpdate = false;
      const dialogRef = this.dialog.open(AddItemCategoryComponent, {
        width: '40%',
        height: '35%', 
      });
      dialogRef.afterClosed().subscribe(result => {
        this.selectTab('category');
      });
    }
  }

  GetItemDetailsData(itemname: any){
          this.api.GetItemTransactions(this.registeredMobileNumber,itemname).subscribe((response:any) => {
              if(response.status == "SUCCESS"){
                this.selectedItem = itemname
                this.dataService.GetItemTransactionsResponse = response.itemTransactionsList
                this.saleprice = response.saleprice
                this.purchaseprice = response.purchaseprice
                this.minimumstocktomaintain = 10
                this.minimumwholesalequantity = 10
                console.log("ITEMS DATA SUCCESS")
              }
              else{
                console.log("ITEMS DATA FAILED")
              }
          })
  }

  GetItemByCategoryData(category: any){
    this.api.GetItemByCategory(this.registeredMobileNumber,category).subscribe({
      next:(res) => {
        console.log("GETITEMDETS API: ",res);
        if(res.status == "SUCCESS") {
          this.selectedCategory = category
          this.dataService.isCategoryUpdate = true
          this.dataService.GetItemByCategoryResponse = res.getItemList;
          // this.api.GetItemByCategory(registeredMobileNumber,category).subscribe({
          //   next:(response) => {
          //     if(res.status == "SUCCESS"){
          //       this.dataService.getItemByCategoryData =  response.getItemList
          //       console.log("ITEMS DATA SUCCESS")
          //     }
          //     else{
          //       console.log("ITEMS DATA FAILED")
          //     }
          //   },
          //   error:() => {
          //     console.log("ITEMS DATA ERROR")
          //   },
          // })
        }
        else {
          this.dataService.isCategoryUpdate = false
          console.log("GETITEMS API failed")
        }
      },
      error:() => {
        console.log("errorrrr")
      }
    })
  }

  productHandleClick(event: MouseEvent, itemName: any) {
    this.clicks.push(event);
    this.itemName = itemName
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
  
  categoryHandleClick(event: MouseEvent,itemCategoryName: any){
    this.clicks.push(event);
    this.categoryName = itemCategoryName
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

  getitemlistdata(){
    this.api.GetItemList(this.registeredMobileNumber).subscribe((res:any) => {
        console.log("GETITEMLIST API: ",res);
        if(res.status == 'SUCCESS') {
          this.selectedItem = res.getItemList[0].itemname
          if(res.getItemList && res.getItemList.length > 0){
            this.itemlist = res.getItemList.map((item:any) => ({
              itemname: item.itemname,
              remainingquantity: item.remainingquantity
            }))
          }
          this.dataService.itemListResponse = res.getItemList
          if(this.itemlist.length > 0){
            this.itemName = this.itemlist[0].itemname
          }
          console.log("ITEMMM: ", this.dataService.itemListResponse[1].saleprice)
          console.log("GETITEMLIST successs")
        }
        else {
          console.log("GETITEMLIST failed")
        }
    })
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
}
