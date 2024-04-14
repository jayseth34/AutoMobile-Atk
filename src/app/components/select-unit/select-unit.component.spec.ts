import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUnitComponent } from './select-unit.component';

describe('SelectUnitComponent', () => {
  let component: SelectUnitComponent;
  let fixture: ComponentFixture<SelectUnitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectUnitComponent]
    });
    fixture = TestBed.createComponent(SelectUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
