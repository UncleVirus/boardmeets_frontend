import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ESignaturePageComponent } from './e-signature-page.component';

describe('ESignaturePageComponent', () => {
  let component: ESignaturePageComponent;
  let fixture: ComponentFixture<ESignaturePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ESignaturePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ESignaturePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
