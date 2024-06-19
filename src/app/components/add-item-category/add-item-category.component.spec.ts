import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddItemCategoryComponent } from './add-item-category.component';

describe('AddItemCategoryComponent', () => {
  let component: AddItemCategoryComponent;
  let fixture: ComponentFixture<AddItemCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddItemCategoryComponent]
    });
    fixture = TestBed.createComponent(AddItemCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
