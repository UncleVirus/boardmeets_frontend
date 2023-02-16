import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractExecutionComponent } from './contract-execution.component';

describe('ContractExecutionComponent', () => {
  let component: ContractExecutionComponent;
  let fixture: ComponentFixture<ContractExecutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractExecutionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
