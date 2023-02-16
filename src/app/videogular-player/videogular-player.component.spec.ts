import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideogularPlayerComponent } from './videogular-player.component';

describe('VideogularPlayerComponent', () => {
  let component: VideogularPlayerComponent;
  let fixture: ComponentFixture<VideogularPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideogularPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideogularPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
