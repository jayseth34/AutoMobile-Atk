import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankHomepageComponent } from './bank-homepage.component';

describe('BankHomepageComponent', () => {
  let component: BankHomepageComponent;
  let fixture: ComponentFixture<BankHomepageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BankHomepageComponent]
    });
    fixture = TestBed.createComponent(BankHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
