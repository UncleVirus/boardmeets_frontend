import { Component, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiManagerService } from '../api-manager/api-manager.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss'],
})
export class ResetPasswordPageComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  formGroup: FormGroup;
  currentUser: any = {};
  passwordHide = true;
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar,
    private router: Router,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.formGroup = this.fb.group({
      email: [this.currentUser?.email, [Validators.required]],
      reset_code: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
    });
  }

  reset_password(data: any) {
    const spinner = this.apiManager.startLoading('Reseting the password.....');
    this.apiManager.resetPassword(data).subscribe(
      (response: any) => {
        this.apiManager.stopLoading(spinner);
        console.log(response);
        this.apiManager.stopLoading(spinner);
        this.openSnackBar('Password changed successful', 'CLOSE');
        this.router.navigate(['/login-page']);
      },
      (error) => {
        this.apiManager.stopLoading(spinner);
        this.openSnackBar('Something went wrong, please try again', 'CLOSE');
        console.log(error);
      }
    );
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
