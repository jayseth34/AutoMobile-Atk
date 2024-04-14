import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyHomepageComponent } from './party-homepage.component';

describe('PartyHomepageComponent', () => {
  let component: PartyHomepageComponent;
  let fixture: ComponentFixture<PartyHomepageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartyHomepageComponent]
    });
    fixture = TestBed.createComponent(PartyHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
