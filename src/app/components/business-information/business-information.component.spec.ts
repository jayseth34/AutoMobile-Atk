import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessInformationComponent } from './business-information.component';

describe('BusinessInformationComponent', () => {
  let component: BusinessInformationComponent;
  let fixture: ComponentFixture<BusinessInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessInformationComponent]
    });
    fixture = TestBed.createComponent(BusinessInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
