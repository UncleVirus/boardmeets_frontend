import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyViewPageComponent } from './survey-view-page.component';

describe('SurveyViewPageComponent', () => {
  let component: SurveyViewPageComponent;
  let fixture: ComponentFixture<SurveyViewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyViewPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
