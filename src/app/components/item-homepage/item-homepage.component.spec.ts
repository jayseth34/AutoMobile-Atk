import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemHomepageComponent } from './item-homepage.component';

describe('ItemHomepageComponent', () => {
  let component: ItemHomepageComponent;
  let fixture: ComponentFixture<ItemHomepageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemHomepageComponent]
    });
    fixture = TestBed.createComponent(ItemHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
