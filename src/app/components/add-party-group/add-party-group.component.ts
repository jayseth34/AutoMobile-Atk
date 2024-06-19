import { Component, Inject, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';

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

  isPartyGroupSave: boolean = false;
  partyGroup: any = '';

  @Input() groupDetails: any;


  constructor(private api: ApiService, private dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.addPartyGroup = new UntypedFormGroup({
      partyGroupNameControl: new UntypedFormControl('', [Validators.required]),
    });

    if(this.data!=null){
      console.log("HEYY: ",this.data)
      this.populateForm(this.data.groupDetails) 
    }
    this.oldPartyGroupName = this.partyGroupName;
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
      console.log("after return");
      let body = {
        registeredPhoneNumber: 9920279905,
        oldgroupname: this.partyGroupName,
        newgroupname: this.partyGroupName
      }
      if (this.isPartyGroupSave){
        body.oldgroupname = this.oldPartyGroupName,
        body.newgroupname = this.newPartyGroupName
      }
      else{
        body.newgroupname = this.oldPartyGroupName,
        body.oldgroupname = this.oldPartyGroupName
      }
      // this.dataService.partyName = this.addPartyData.partyName;
      // debugger;
      this.api.AddGroupDetails(JSON.stringify(body)).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res == "Success") {
          console.log("Success group", res)
          this.partyGroupName = this.newPartyGroupName
        }
        else{
          console.log("Failed")
        }
        resolve();
      });
    });
  }

  refreshPage() {
    window.location.reload();
  }

  submit() {
    // debugger;
    if(this.addPartyGroup.valid) {
      this.isPartyGroupSave = true
      this.AddGroupData(this.addPartyGroup.value);
      this.refreshPage();
    } 
    else{
      this.isPartyGroupSave = false
    }
  }
  

  get partyGroupNameControl() { return this.addPartyGroup.get('partyGroupNameControl')}

}
