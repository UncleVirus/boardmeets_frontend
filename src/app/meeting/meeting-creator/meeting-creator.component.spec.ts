import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingCreatorComponent } from './meeting-creator.component';

describe('MeetingCreatorComponent', () => {
  let component: MeetingCreatorComponent;
  let fixture: ComponentFixture<MeetingCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeetingCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
