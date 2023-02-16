import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BnNgIdleService } from 'bn-ng-idle';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { LicensesService } from '../services/licenses.service';
import { ApiManagerService } from '../api-manager/api-manager.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './index.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  currentUser: any;
  org_reference_key: any;
  zoom = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private bnIdle: BnNgIdleService,
    private router: Router,
    private apiManager: ApiManagerService,
    private lisenseService: LicensesService,
    private sharedService: SharedService
  ) {
    this.sharedService.zoomOpen.subscribe((value) => (this.zoom = value));
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    if (!this.currentUser) {
      this.router.navigate(['/login-page']);
      return;
    }
    this.org_reference_key = this.currentUser?.org_reference_key;
    this.bnIdle.startWatching(1800).subscribe((timeOut: boolean) => {
      if (timeOut) {
        this.removeActiveUser();
      }
    });
  }

  removeActiveUser() {
    const data = { organization_id: this.org_reference_key };
    console.log(data);
    this.lisenseService.removeActiveUser(data).subscribe(
      (response) => {
        this.bnIdle.resetTimer();
        this.sessionStorage.clear();
        this.router.navigate(['/login-page']);
      },
      (error) => console.log(error)
    );
  }
}
