import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureViewPageComponent } from './signature-view-page.component';

describe('SignatureViewPageComponent', () => {
  let component: SignatureViewPageComponent;
  let fixture: ComponentFixture<SignatureViewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignatureViewPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
