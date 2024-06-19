import { Component, Inject, Input, ViewChild } from '@angular/core';
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
  // selectedTab: string = 'product'; // Initially select the 'address' tab
  clickSubscription: Subscription;
  clicks: any[] = [];

  @ViewChild('app-add-item') addItemModal: AddItemComponent;

  constructor(private dialog: MatDialog, public dataService: DataService, private api: ApiService){}

  ngOnInit() {
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
    }


  // rows = [
  //   { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  //   { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  //   { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  //   { column1: 'Row 2, Column 1', column2: 'Row 2, Column 2', column3: 'Row 2, Column 3', column4: 'Row 2, Column 4', column5: 'Row 2, Column 5', column6: 'Row 2, Column 6', column7: 'Row 2, Column 7' },{ column1: 'Row 1, Column 1', column2: 'Row 1, Column 2', column3: 'Row 1, Column 3', column4: 'Row 1, Column 4', column5: 'Row 1, Column 5', column6: 'Row 1, Column 6', column7: 'Row 1, Column 7'},
  // ];
  
  destroy$: Subject<boolean> = new Subject<boolean>();

  openAddItemModal(registeredMobileNumber:any, itemName: any ) {
    if(registeredMobileNumber!='' && itemName!=''){

      this.api.GetItemDetails(registeredMobileNumber,itemName).subscribe({
        next: (res) =>{
          if (res.status === "SUCCESS") {
            this.dataService.isItemUpdate = true;
            this.dataService.oldItemName = itemName
            const dialogRef = this.dialog.open(AddItemComponent, {
              width: '60%',
              height: '99%',
              data: { itemDetails: res.itemList[0] , itemName} // Pass the data here
            });
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
      const dialogRef = this.dialog.open(AddItemComponent, {
        width: '60%',
        height: '99%', 
      });
      dialogRef.afterClosed().subscribe(result => {
        // Handle the result here if needed
      });
    }
  }

  selectTab(tab: string) {
    this.dataService.itemHomePageSelectedTab = tab;
  }

  openAddItemCategoryModal() {
    const dialogRef = this.dialog.open(AddItemCategoryComponent, {
      width: '40%',
      height: '35%', 
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  GetItemDetailsData(registeredMobileNumber: any, itemname: any){
    this.api.GetItemDetails(registeredMobileNumber,itemname).pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        console.log("GETITEMDETS API: ",res);
        if(res.status == "SUCCESS") {
          this.dataService.getItemDetailsData =  res.itemList
          this.api.GetItemTransactions(registeredMobileNumber,itemname).pipe(takeUntil(this.destroy$)).subscribe({
            next:(response) => {
              if(response.status == "SUCCESS"){
                this.dataService.GetItemTransactionsResponse = response.itemTransactionsList
                console.log("ITEMS DATA SUCCESS")
              }
              else{
                console.log("ITEMS DATA FAILED")
              }
            },
            error:() => {
              console.log("ITEMS DATA ERROR")
            },
          })
        }
        else {
          console.log("GETITEMS API failed")
        }
      },
      error:() => {
        console.log("errorrrr")
      }
    })
  }

  GetItemByCategoryData(registeredMobileNumber: any, category: any){
    this.api.GetItemByCategory(registeredMobileNumber,category).pipe(takeUntil(this.destroy$)).subscribe({
      next:(res) => {
        console.log("GETITEMDETS API: ",res);
        if(res.status == "SUCCESS") {
          this.dataService.GetItemByCategoryResponse = res.getItemList;
          // this.api.GetItemByCategory(registeredMobileNumber,category).pipe(takeUntil(this.destroy$)).subscribe({
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
          console.log("GETITEMS API failed")
        }
      },
      error:() => {
        console.log("errorrrr")
      }
    })
  }

  productHandleClick(event: MouseEvent,registeredMobileNumber:any, itemName: any) {
    this.clicks.push(event);
  
    setTimeout(() => {
      if (this.clicks.length === 1) {
        // Single click detected
        this.GetItemDetailsData('9920279905',itemName);
      } else if (this.clicks.length === 2) {
        // Double click detected
        this.openAddItemModal('9920279905',itemName);
      }
      this.clicks = [];
    }, 250);
  }
  
  categoryHandleClick(event: MouseEvent,registeredMobileNumber:any, itemGroupName: any){
    this.clicks.push(event);
  
    setTimeout(() => {
      if (this.clicks.length === 1) {
        // Single click detected
        this.GetItemByCategoryData('9920279905',itemGroupName);
      } else if (this.clicks.length === 2) {
        // Double click detected
        this.openAddItemCategoryModal();
      }
      this.clicks = [];
    }, 250);
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.clickSubscription.unsubscribe();
  }
}
