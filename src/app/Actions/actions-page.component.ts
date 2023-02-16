import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { ApiManagerService } from '../api-manager/api-manager.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SignaturePad } from 'angular2-signaturepad';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-actions-page',
  templateUrl: './actions-page.component.html',
  styleUrls: ['./actions-page.component.scss'],
})
export class ActionsComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  votesObj: any = [];
  signatureObj: any = [];

  surveyObj: any = [];
  currentUser: any = {};

  signature = false;
  voting = false;
  survey = false;

  constructor(
    private router: Router,
    private apiManager: ApiManagerService,
    private shareService: SharedService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));

    this.route.params.subscribe((params) => {
      const id = params.action;

      if (id === 'voting') {
        this.signature = false;
        this.voting = true;
        this.survey = false;
        this.getVoteApproval();
      } else if (id === 'signature') {
        this.signature = true;
        this.voting = false;
        this.survey = false;
        this.getDocumetSignature();
      } else {
        this.signature = false;
        this.voting = false;
        this.survey = true;
        this.getAllSurveys();
      }
    });
  }

  getDocumetSignature() {
    const spinner = this.apiManager.startLoading('Loading eSignatures........');
    this.apiManager.getDocumetSignature().subscribe({
      next: (res) => {
        this.signatureObj = res;
        console.log(res);
        this.apiManager.stopLoading(spinner);
      },
      error: (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }

  getAllSurveys() {
    const spinner = this.apiManager.startLoading('Loading Surveys........');
    this.apiManager.getAllSurveys().subscribe({
      next: (res) => {
        this.surveyObj = res;
        console.log(res);
        this.apiManager.stopLoading(spinner);
      },
      error: (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }

  getVoteApproval() {
    const spinner = this.apiManager.startLoading('Loading Approvals........');
    this.apiManager.getAllquestions().subscribe({
      next: (res) => {
        this.votesObj = res;
        console.log(res);
        this.apiManager.stopLoading(spinner);
      },
      error: (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }

  deleteSignature(id) {
    return this.apiManager.deleteSignatureDocument(id).subscribe(
      (res) => {
        this.getDocumetSignature();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  updateSurvey(status: any, survey: any) {
    const param = {
      survey_status: status,
    };
    const survey_id = survey['id'];
    this.apiManager.updateSurvey(survey_id, param).subscribe(
      (resp) => {
        this.getAllSurveys();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  createvoteDialog(): void {
    const dialogRef = this.dialog.open(CreateVoteDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log(result);
        this.getVoteApproval();
      }
    });
  }

  viewVotingDetail(data: any) {
    const path = '/admin/voting-page';
    const param = {
      voting: this.sharedService.encryptData(data),
    };
    this.sharedService.navigaTo(path, param);
  }

  openSurveyObjView(obj: any) {
    const path = '/admin/survey-view';
    const param = {
      survey: this.sharedService.encryptData(obj),
    };
    this.sharedService.navigaTo(path, param);
  }
  openSurveyResults(survey) {
    const path = '/admin/survey-results';
    const param = {
      survey: this.sharedService.encryptData(survey),
    };
    this.sharedService.navigaTo(path, param);
  }
  openSignature(signature) {
    const path = '/admin/signature-view-page';
    const param = {
      signature: this.sharedService.encryptData(signature),
    };
    this.sharedService.navigaTo(path, param);
  }

  deleteQuestion(questionId: any) {
    this.apiManager.deleteQuestionById(questionId).subscribe(
      (res) => {
        this.openSnackBar('Approval deleted successful', 'Ok');
        this.getVoteApproval();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  deleteSurvey(surveyId: any) {
    this.apiManager.deleteSurvey(surveyId).subscribe(
      (res) => {
        console.log(res);
        this.getAllSurveys();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}

@Component({
  selector: 'app-create-vote-modal',
  templateUrl: './create-vote-dialog.html',
  styleUrls: ['./actions-page.component.scss'],
})
export class CreateVoteDialog implements OnInit {
  sessionStorage = window.sessionStorage;
  task_document: any = '';
  currentUser: any = {};
  formGroup: FormGroup;
  organizations: any = [];
  meetingsObj: any = [];
  users: any = [];
  loading = false;
  enableAttachmentView = false;
  files: File[] = [];
  fileUrl = '';
  sendemail: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CreateVoteDialog>,
    public snackBar: MatSnackBar,
    private apiManager: ApiManagerService,
    private formBwilder: FormBuilder
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.getAllUsers();
    this.createForm();
  }

  getAllUsers() {
    this.apiManager.getAllUsers().subscribe(
      (resp) => {
        this.users = resp;
      },
      (error) => console.log(error)
    );
  }

  createForm() {
    this.formGroup = this.formBwilder.group({
      title: ['', [Validators.required]],
      vote_start_date: ['', [Validators.required]],
      vote_end_date: ['', [Validators.required]],
      description: ['', [Validators.required]],
      voters: ['', [Validators.required]],
      created_by: [this.currentUser?.id, [Validators.required]],
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(data: any) {
    this.loading = true;
    data['sendEmail'] = this.sendemail;
    if (this.fileUrl) {
      data['supporting_documents'] = this.fileUrl;
    }
    console.log(data);
    this.apiManager.createVote(data).subscribe(
      (response: any) => {
        this.loading = false;
        if (response) {
          this.openSnackBar('Vote created successful', 'CLOSE');
          this.dialogRef.close(response);
        }
      },
      (error: any) => {
        this.loading = false;
        this.openSnackBar('Details: Something went wrong', 'CLOSE');
      }
    );
  }

  enableSendEmail() {
    if (this.sendemail === false) this.sendemail = true;
    else this.sendemail = false;
  }

  //add attachment
  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    if (this.files[0]) {
      const file = this.files[0];

      this.changeFile(file).then((fileBlob: string): any => {
        this.fileUrl = fileBlob;
      });
    }
    return;
  }
  //change to blob data
  changeFile(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  //remove attachment
  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
    this.fileUrl = '';
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
