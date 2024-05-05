import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-party-group',
  templateUrl: './add-party-group.component.html',
  styleUrls: ['./add-party-group.component.css']
})
export class AddPartyGroupComponent {
  partyGroupName: any = '';
  addPartyGroup: UntypedFormGroup;

  constructor() { }

  ngOnInit() {
    this.addPartyGroup = new UntypedFormGroup({
      partyGroupNameControl: new UntypedFormControl('', [Validators.required]),
    });
  }

  get partyNameControl() { return this.addPartyGroup.get('partyNameControl')}

}
