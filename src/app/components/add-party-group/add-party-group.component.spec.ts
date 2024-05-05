import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPartyGroupComponent } from './add-party-group.component';

describe('AddPartyGroupComponent', () => {
  let component: AddPartyGroupComponent;
  let fixture: ComponentFixture<AddPartyGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPartyGroupComponent]
    });
    fixture = TestBed.createComponent(AddPartyGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
