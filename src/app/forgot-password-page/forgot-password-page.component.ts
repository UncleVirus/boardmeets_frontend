import { Component, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ApiManagerService } from '../api-manager/api-manager.service';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss'],
})
export class ForgotPasswordPageComponent implements OnInit {
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
      email: ['', [Validators.required]],
    });
  }

  forgotPassword(data) {
    const spinner = this.apiManager.startLoading(
      'Sending the instructions....'
    );
    this.apiManager.forgotPassword(data).subscribe(
      (response: any) => {
        this.apiManager.stopLoading(spinner);

        this.openSnackBar(
          'Reset code has been sent, kindly check your email',
          'CLOSE'
        );
        this.router.navigate(['/reset-password-page']);
      },
      (error) => {
        this.openSnackBar('Email not sent, try again.', 'CLOSE');
        this.apiManager.stopLoading(spinner);
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
