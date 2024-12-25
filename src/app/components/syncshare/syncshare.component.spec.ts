import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncshareComponent } from './syncshare.component';

describe('SyncshareComponent', () => {
  let component: SyncshareComponent;
  let fixture: ComponentFixture<SyncshareComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SyncshareComponent]
    });
    fixture = TestBed.createComponent(SyncshareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
