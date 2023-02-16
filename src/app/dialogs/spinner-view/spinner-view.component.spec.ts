import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerViewComponent } from './spinner-view.component';

describe('SpinnerViewComponent', () => {
  let component: SpinnerViewComponent;
  let fixture: ComponentFixture<SpinnerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpinnerViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
