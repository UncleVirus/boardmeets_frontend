import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingAgendaOpenbookComponent } from './meeting-agenda-openbook.component';

describe('MeetingAgendaOpenbookComponent', () => {
  let component: MeetingAgendaOpenbookComponent;
  let fixture: ComponentFixture<MeetingAgendaOpenbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeetingAgendaOpenbookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingAgendaOpenbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
