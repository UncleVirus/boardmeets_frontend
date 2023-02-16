import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyUserPageComponent } from './verify-user-page.component';

describe('VerifyUserPageComponent', () => {
  let component: VerifyUserPageComponent;
  let fixture: ComponentFixture<VerifyUserPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyUserPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyUserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
