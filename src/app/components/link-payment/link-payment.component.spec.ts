import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkPaymentComponent } from './link-payment.component';

describe('LinkPaymentComponent', () => {
  let component: LinkPaymentComponent;
  let fixture: ComponentFixture<LinkPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkPaymentComponent]
    });
    fixture = TestBed.createComponent(LinkPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
