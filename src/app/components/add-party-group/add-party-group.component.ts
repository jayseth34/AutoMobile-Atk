import { Component, Inject, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-party-group',
  templateUrl: './add-party-group.component.html',
  styleUrls: ['./add-party-group.component.css']
})
export class AddPartyGroupComponent {
  registeredMobileNumber: any;
  partyGroupName: any = '';
  oldPartyGroupName: any;
  newPartyGroupName: any;

  addPartyGroup: UntypedFormGroup;

  partyGroup: any = '';

  @Input() groupDetails: any;


  constructor(private api: ApiService, private dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.addPartyGroup = new UntypedFormGroup({
      partyGroupNameControl: new UntypedFormControl('', [Validators.required]),
    });

    if(this.data!=null){
      this.populateForm(this.data.groupDetails) 
    }
  }

  populateForm(fetchedPartyGroupName: any){
    if(fetchedPartyGroupName){
      this.partyGroupName = fetchedPartyGroupName;
    }
  }

  onInputChange(event: any) {
    // Update newgroupname with the new value
    this.newPartyGroupName = event.target.value;
    console.log("OLD: ",this.oldPartyGroupName,"NEW: ",this.newPartyGroupName)
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  AddGroupData(body: any): Promise<void> {
    // debugger
    console.log("BEFore return");
    return new Promise((resolve) => {
      this.oldPartyGroupName = this.partyGroupName;
      console.log("after return");
      let body = {
        registeredPhoneNumber: 9920279905,
        oldgroupname:  this.oldPartyGroupName,
        newgroupname: this.partyGroupName
      }
      if (this.dataService.isGroupUpdate){
        body.oldgroupname =  this.dataService.oldPartyGroupName,
        body.newgroupname = this.newPartyGroupName
      }
      else{
        body.newgroupname =   this.newPartyGroupName,
        body.oldgroupname =   this.newPartyGroupName
      }
      // this.dataService.partyName = this.addPartyData.partyName;
      // debugger;
      this.api.AddGroupDetails(JSON.stringify(body)).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.status == 'SUCCESS') {
          Swal.fire({
            text: res.status,
            confirmButtonText: 'OK',
          })
          this.partyGroupName = this.newPartyGroupName
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
    if(this.addPartyGroup.valid) {
      this.AddGroupData(this.addPartyGroup.value);
      // window.location.href = 'http://localhost:4200/party-homepage';
    } 
    else{
    }
  }
  

  get partyGroupNameControl() { return this.addPartyGroup.get('partyGroupNameControl')}

}
