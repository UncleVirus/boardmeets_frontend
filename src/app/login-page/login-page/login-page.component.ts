import { Component, OnInit } from '@angular/core';
import { ApiManagerService } from './../../api-manager/api-manager.service';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';
import { LicensesService } from 'src/app/services/licenses.service';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  isAdmin: any = false;
  passwordHide = true;

  formGroup: FormGroup;
  today = new Date();
  hide = true;

  license_expire_message = 'License Exhausted, please contact the admin';
  success_login_message = 'You have successfully logged In';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiManager: ApiManagerService,
    public snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.sessionStorage.clear();
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(data: any) {
    const spinner = this.apiManager.startLoading('please wait...');
    const obs = this.apiManager.login(data).subscribe(
      (response: any) => {
        this.apiManager.stopLoading(spinner);
        if (!this.sessionStorage.getItem('token')) {
          this.openSnackBar('Oops! Something went wrong! try again', 'CLOSE');
          return;
        } else if (response?.status === 'License Exhausted') {
          this.openSnackBar(this.license_expire_message, 'CLOSE');
          return;
        } else {
          this.openSnackBar(this.success_login_message, 'CLOSE');
          this.router.navigate(['/admin/landing-page']);
        }
      },
      (error: any) => {
        this.apiManager.stopLoading(spinner);
        this.openSnackBar('Invalid credentials', 'OK');
        if (error?.error.status === 'Ok')
          this.router.navigate(['/verify-user']);
      }
    );
  }
  forgotPassword() {
    this.router.navigate(['/forgot-password-page']);
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
