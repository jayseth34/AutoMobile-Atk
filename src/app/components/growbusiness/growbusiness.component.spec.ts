import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowbusinessComponent } from './growbusiness.component';

describe('GrowbusinessComponent', () => {
  let component: GrowbusinessComponent;
  let fixture: ComponentFixture<GrowbusinessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GrowbusinessComponent]
    });
    fixture = TestBed.createComponent(GrowbusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
