import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMemberDropdownComponent } from './search-member-dropdown.component';

describe('SearchMemberDropdownComponent', () => {
  let component: SearchMemberDropdownComponent;
  let fixture: ComponentFixture<SearchMemberDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchMemberDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMemberDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
