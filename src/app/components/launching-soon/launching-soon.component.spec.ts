import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchingSoonComponent } from './launching-soon.component';

describe('LaunchingSoonComponent', () => {
  let component: LaunchingSoonComponent;
  let fixture: ComponentFixture<LaunchingSoonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LaunchingSoonComponent]
    });
    fixture = TestBed.createComponent(LaunchingSoonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
