import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompliancePageComponent } from './compliance-page.component';

describe('CompliancePageComponent', () => {
  let component: CompliancePageComponent;
  let fixture: ComponentFixture<CompliancePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompliancePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompliancePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
