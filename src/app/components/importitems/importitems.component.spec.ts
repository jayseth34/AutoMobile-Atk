import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportitemsComponent } from './importitems.component';

describe('ImportitemsComponent', () => {
  let component: ImportitemsComponent;
  let fixture: ComponentFixture<ImportitemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportitemsComponent]
    });
    fixture = TestBed.createComponent(ImportitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
