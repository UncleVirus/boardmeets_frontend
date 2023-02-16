import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceViewComponent } from './compliance-view.component';

describe('ComplianceViewComponent', () => {
  let component: ComplianceViewComponent;
  let fixture: ComponentFixture<ComplianceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplianceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
