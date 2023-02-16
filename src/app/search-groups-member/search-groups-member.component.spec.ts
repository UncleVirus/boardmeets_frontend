import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchGroupsMemberComponent } from './search-groups-member.component';

describe('SearchGroupsMemberComponent', () => {
  let component: SearchGroupsMemberComponent;
  let fixture: ComponentFixture<SearchGroupsMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchGroupsMemberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchGroupsMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
