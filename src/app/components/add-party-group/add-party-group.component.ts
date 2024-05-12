import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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

  addPartyGroup: UntypedFormGroup;

  isSave: boolean = false;
  partyGroup: any = '';

  constructor(private api: ApiService, private dataService: DataService) { }

  ngOnInit() {
    this.addPartyGroup = new UntypedFormGroup({
      partyGroupNameControl: new UntypedFormControl('', [Validators.required]),
    });
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  AddGroupData(body: any): Promise<void> {
    debugger
    console.log("BEFore return");
    return new Promise((resolve) => {
      console.log("after return");
      let body = {
        registeredPhoneNumber: 9920279905,
        oldgroupname: this.partyGroupName,
        newgroupname: this.partyGroupName
      }
      if (this.isSave){
        body.oldgroupname = this.partyGroupName,
        body.newgroupname = this.partyGroupName
      }
      else{
        body.newgroupname = this.partyGroupName,
        body.oldgroupname = this.dataService.partyGroupListResponse.partygroup
      }
      // this.dataService.partyName = this.addPartyData.partyName;
      debugger;
      this.api.AddGroupDetails(JSON.stringify(body)).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res == "Success") {
          console.log("Success group", res)
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
      this.isSave = true
      this.AddGroupData(this.addPartyGroup.value);
    } 
    else{
      this.isSave = false
    }
  }
  

  get partyGroupNameControl() { return this.addPartyGroup.get('partyGroupNameControl')}

}
