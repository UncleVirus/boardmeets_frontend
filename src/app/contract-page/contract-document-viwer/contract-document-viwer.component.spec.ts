import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDocumentViwerComponent } from './contract-document-viwer.component';

describe('ContractDocumentViwerComponent', () => {
  let component: ContractDocumentViwerComponent;
  let fixture: ComponentFixture<ContractDocumentViwerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractDocumentViwerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractDocumentViwerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
