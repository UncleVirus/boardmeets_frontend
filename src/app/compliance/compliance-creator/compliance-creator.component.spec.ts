import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceCreatorComponent } from './compliance-creator.component';

describe('ComplianceCreatorComponent', () => {
  let component: ComplianceCreatorComponent;
  let fixture: ComponentFixture<ComplianceCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplianceCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
