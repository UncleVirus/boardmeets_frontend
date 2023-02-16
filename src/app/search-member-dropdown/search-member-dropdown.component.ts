import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { ApiManagerService } from '../api-manager/api-manager.service';

@Component({
  selector: 'app-search-member-dropdown',
  templateUrl: './search-member-dropdown.component.html',
  styleUrls: ['./search-member-dropdown.component.scss'],
})
export class SearchMemberDropdownComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  /** list of banks */
  protected banks: any = [];

  /** control for the selected bank for multi-selection */
  @Input() bankMultiCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword multi-selection */
  public bankMultiFilterCtrl: FormControl = new FormControl();

  /** list of banks filtered by search keyword */
  public filteredBanksMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public tooltipMessage = 'Select All / Unselect All';

  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  constructor(private apiManager: ApiManagerService) {}

  ngOnInit() {
    // set initial selection
    this.apiManager.getAllUsers().subscribe({
      next: (res: any) => {
        this.banks = res;
        this.setupInitial();
      },
    });
  }

  setupInitial() {
    // load the initial bank list
    this.filteredBanksMulti.next(this.banks.slice());

    // listen for search field value changes
    this.bankMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanksMulti();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  toggleSelectAll(selectAllValue: boolean) {
    this.filteredBanksMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          const users_id = this.getUserIds(val);
          if (users_id) {
            this.bankMultiCtrl.patchValue(users_id);
          }
        } else {
          this.bankMultiCtrl.patchValue([]);
        }
      });
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  protected setInitialValue() {
    this.filteredBanksMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.multiSelect.compareWith = (a: any, b: any) =>
          a && b && a.id === b.id;
      });
  }

  protected filterBanksMulti() {
    if (!this.banks) {
      return;
    }
    // get the search keyword
    let search = this.bankMultiFilterCtrl.value;
    if (!search) {
      this.filteredBanksMulti.next(this.banks.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBanksMulti.next(
      this.banks.filter(
        (bank) =>
          bank.first_name.toLowerCase().indexOf(search) > -1 ||
          bank.last_name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getUserIds(obj) {
    let user_ids = [];
    if (obj) {
      for (let i = 0; i <= obj.length; i++) {
        if (obj[i]?.id) {
          user_ids.push(obj[i]?.id);
        }
      }
      return user_ids;
    } else return [];
  }
}
