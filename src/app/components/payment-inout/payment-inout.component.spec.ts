import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInoutComponent } from './payment-inout.component';

describe('PaymentInoutComponent', () => {
  let component: PaymentInoutComponent;
  let fixture: ComponentFixture<PaymentInoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentInoutComponent]
    });
    fixture = TestBed.createComponent(PaymentInoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
