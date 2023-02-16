import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LicensesService } from '../services/licenses.service';
import { Router } from '@angular/router';
import { ApiManagerService } from '../api-manager/api-manager.service';

@Component({
  selector: 'app-admin-navigation',
  templateUrl: './admin-navigation.component.html',
  styleUrls: ['./admin-navigation.component.scss'],
})
export class AdminNavigationComponent implements OnInit, AfterViewInit {
  sessionStorage = window.sessionStorage;
  company: any = {};
  title: string = '';
  @ViewChild('dashboard') dashEl: ElementRef;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  currentUser: any;
  constructor(
    private breakpointObserver: BreakpointObserver,
    private apiManager: ApiManagerService,
    private api: ApiManagerService,
    private router: Router,
    private renderer: Renderer2,
    private licenseService: LicensesService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    if (!this.currentUser) {
      this.router.navigate(['/login-page']);
      return;
    }
    this.getOrganizationDetails();
    this.register_device();
  }

  logout() {
    this.removeActiveUser();
    this.signOut();
  }
  signOut() {
    const spinner = this.api.startLoading('Sign Out...');
    this.api.logout().subscribe({
      next: (res) => {
        this.api.stopLoading(spinner);

        this.router.navigate(['/login-page']);
      },
      error: (err) => {
        this.api.stopLoading(spinner);
        this.router.navigate(['/login-page']);
      },
    });
  }

  getOrganizationDetails() {
    const ref = this.currentUser?.org_reference_key;
    this.licenseService.getOrganizationByOrRegNo(ref).subscribe({
      next: (res) => {
        console.log('res', res);
        this.company = res[0];
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  removeActiveUser() {
    const spinner = this.api.startLoading('Removing license...');
    const org_ref = this.currentUser?.org_reference_key;
    const data = { organization: org_ref };
    this.licenseService.removeActiveUser(data).subscribe(
      (response) => {
        this.signOut();
        this.api.stopLoading(spinner);
      },
      (error) => {
        console.log(error);
        this.api.stopLoading(spinner);
      }
    );
  }

  @HostListener('document:click', ['$event'])
  onMouseMove(e) {
    const elementId = this.sessionStorage.getItem('el');
    if (elementId) {
      this.setElFocus(elementId);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    //check something before reload
  }

  setTitle(title: string, id: string) {
    this.sessionStorage.setItem('title', title);
    this.sessionStorage.setItem('el', id);
    this.title = title;
    this.setElFocus(id);
  }

  setElFocus(id: string) {
    setTimeout(() => {
      //this.renderer.selectRootElement(`${id}`);
    }, 0);
  }

  register_device() {
    const data = JSON.parse(this.sessionStorage.getItem('device'));
    this.apiManager.device_user_registration(data).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngAfterViewInit() {
    const elementId = this.sessionStorage.getItem('el');
    if (elementId) {
      this.setElFocus(elementId);
    }
  }
}
