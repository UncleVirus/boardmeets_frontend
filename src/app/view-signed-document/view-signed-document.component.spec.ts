import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSignedDocumentComponent } from './view-signed-document.component';

describe('ViewSignedDocumentComponent', () => {
  let component: ViewSignedDocumentComponent;
  let fixture: ComponentFixture<ViewSignedDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewSignedDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSignedDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
