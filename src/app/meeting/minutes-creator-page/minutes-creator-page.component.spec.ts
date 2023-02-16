import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinutesCreatorPageComponent } from './minutes-creator-page.component';

describe('MinutesCreatorPageComponent', () => {
  let component: MinutesCreatorPageComponent;
  let fixture: ComponentFixture<MinutesCreatorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinutesCreatorPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MinutesCreatorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
