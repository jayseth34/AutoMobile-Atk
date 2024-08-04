import { Component, Inject, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

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

  itemCategory: any = '';
  @Input() categorynameDetails: any;

  constructor(private api: ApiService, @Inject(MAT_DIALOG_DATA) public data: any, public dataService: DataService,public dialogRef: MatDialogRef<AddItemCategoryComponent>,) { }

  ngOnInit() {
    this.registeredMobileNumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
    this.addItemCategory = new UntypedFormGroup({
      itemCategoryNameControl: new UntypedFormControl('', [Validators.required]),
    });

    if(this.data!=null){
      this.populateForm(this.data.categorynameDetails) 
    }
  }

  populateForm(fetchedCategoryName: any){
    if(fetchedCategoryName){
      this.itemCategoryName = fetchedCategoryName;
    }
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  onInputChange(event: any) {
    // Update newgroupname with the new value
    this.newcategory = event.target.value;
    console.log("OLD: ",this.oldcategory,"NEW: ",this.newcategory)
  }

  AddCategoryData(body: any): Promise<void> {
    console.log("BEFore return");
    return new Promise((resolve) => {
      console.log("after return");
      let body = {
        registeredPhoneNumber: this.registeredMobileNumber,
        newcategory: this.newcategory,
        oldcategory: this.oldcategory
      }
      if (this.dataService.isCategoryUpdate){
        body.newcategory = this.newcategory,
        body.oldcategory = this.dataService.oldCategoryName
      }
      else{
        body.newcategory = this.newcategory,
        body.oldcategory = this.newcategory
      }
      // this.dataService.partyName = this.addPartyData.partyName;
      this.api.AddUpdateCategory(JSON.stringify(body)).subscribe(res => {
        if (res.status == "Success") {
          this.itemCategoryName = this.newcategory
          Swal.fire({
            text: res.statusmessage,
            confirmButtonText: 'OK',
          }).then(() => {
            this.dialogRef.close();
          });
          console.log("Success category", res)
        }
        else if (res.status == "Failed"){
          Swal.fire({
            text: res.statusmessage,
            confirmButtonText: 'OK',
          })
          console.log("Failed")
        }
        resolve();
      });
    });
  }

  submit() {
    if(this.addItemCategory.valid) {
      this.AddCategoryData(this.addItemCategory.value);
    } 
    else{
    }
  }
  

  get itemCategoryNameControl() { return this.addItemCategory.get('itemCategoryNameControl')}
}
