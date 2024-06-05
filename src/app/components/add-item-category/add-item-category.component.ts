import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-add-item-category',
  templateUrl: './add-item-category.component.html',
  styleUrls: ['./add-item-category.component.css']
})
export class AddItemCategoryComponent {
  registeredMobileNumber: any;
  itemCategoryName: any = '';
  newcategory: any ;
  oldcategory: any;

  addItemCategory: UntypedFormGroup;

  isSave: boolean = false;
  itemCategory: any = '';

  constructor(private api: ApiService, private dataService: DataService) { }

  ngOnInit() {
    this.addItemCategory = new UntypedFormGroup({
      itemCategoryNameControl: new UntypedFormControl('', [Validators.required]),
    });
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  AddCategoryData(body: any): Promise<void> {
    // debugger
    console.log("BEFore return");
    return new Promise((resolve) => {
      console.log("after return");
      let body = {
        registeredPhoneNumber: 9920279905,
        newcategory: this.newcategory,
        oldcategory: this.oldcategory
      }
      if (this.isSave){
        body.newcategory = this.newcategory,
        body.oldcategory = this.oldcategory
      }
      else{
        body.newcategory = this.newcategory,
        body.oldcategory = this.dataService.partyGroupListResponse.partygroup
      }
      // this.dataService.partyName = this.addPartyData.partyName;
      // debugger;
      this.api.AddUpdateCategory(JSON.stringify(body)).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res == "Success") {
          console.log("Success category", res)
        }
        else{
          console.log("Failed")
        }
        resolve();
      });
    });
  }

  submit() {
    // debugger;
    if(this.addItemCategory.valid) {
      this.isSave = true
      this.AddCategoryData(this.addItemCategory.value);
    } 
    else{
      this.isSave = false
    }
  }
  

  get itemCategoryNameControl() { return this.addItemCategory.get('itemCategoryNameControl')}
}
