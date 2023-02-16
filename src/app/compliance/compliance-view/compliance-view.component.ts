import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-compliance-view',
  templateUrl: './compliance-view.component.html',
  styleUrls: ['./compliance-view.component.css'],
})
export class ComplianceViewComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  complianceOb: any = {};
  checkList: any = [];
  complianceId: any = '';
  currentUser: any = {};
  evidence = '';
  constructor(
    private sharedService: SharedService,
    public _location: Location,
    private apiManager: ApiManagerService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _route: ActivatedRoute,
    private router: Router
  ) {
    this._route.params.subscribe((params) => {
      if (params['compliance']) {
        this.loadCompliance(params['compliance']);
      } else this._location.back();
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.sessionStorage.getItem('profile'));
    this.initializePage();
  }

  initializePage() {}

  complyCheck(check_id, ans) {
    const compliance_id = this.complianceOb.id;
    const param = {
      check_status: ans,
    };
    if (this.evidence) param['check_evidence'] = this.evidence;
    this.apiManager.markChecklist(compliance_id, check_id, param).subscribe({
      next: (res: any) => {
        this.updateChecklist(res);
      },
      error: (err) => console.log(err),
    });
  }

  updateChecklist(obj) {
    for (let i = 0; i <= this.checkList.length; i++) {
      if (this.checkList[i].id === obj.id) {
        this.checkList[i] = obj;
        return;
      }
    }
  }

  openEditComplianceDialog(data): void {
    const dialogRef = this.dialog.open(DialogEditComplianceDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: data,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const path = '/admin/compliance-view';
        const param = {
          compliance: this.sharedService.encryptData(result),
        };
        this.sharedService.navigaTo(path, param);
      }
    });
  }
  openEditComplianceCheckDialog(data): void {
    const dialogRef = this.dialog.open(DialogEditComplianceCheckDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: data,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result == 'OK') {
          this.getChecklist();
        } else {
          this.updateChecklist(result);
        }
      }
    });
  }

  getChecklist() {
    const compliance_id = this.complianceOb.id;
    this.apiManager.getCheclist(compliance_id).subscribe({
      next: (res) => {
        this.checkList = res;
      },
      error: (err) => console.log(err),
    });
  }

  loadCompliance(complianceObj: any) {
    this.complianceOb = this.sharedService.decryptData(complianceObj);

    if (this.complianceOb) {
      this.getChecklist();
    } else this._location.back();
  }
}

@Component({
  selector: 'dialog-edit-compliance-dialog',
  templateUrl: 'dialog-edit-compliance-dialog.html',
  styleUrls: ['./compliance-view.component.css'],
})
export class DialogEditComplianceDialog {
  formGroup: FormGroup;
  loading = false;
  title = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogEditComplianceDialog>,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.title = this.data?.action;
    this.createForm();
  }
  createForm() {
    this.formGroup = this.formBwilder.group({
      compliance_name: [this.data.compliance_name, [Validators.required]],
      compliance_start_date: [
        this.data.compliance_start_date,
        [Validators.required],
      ],
      compliance_end_date: [
        this.data.compliance_end_date,
        [Validators.required],
      ],
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    const compliance_id = this.data.id;
    this.loading = true;
    this.apiManager.updateCompliance(compliance_id, data).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
}

@Component({
  selector: 'dialog-edit-compliance-check-dialog',
  templateUrl: 'dialog-edit-compliance-check-dialog.html',
  styleUrls: ['./compliance-view.component.css'],
})
export class DialogEditComplianceCheckDialog {
  formGroup: FormGroup;
  loading = false;
  title = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogEditComplianceCheckDialog>,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.title = this.data?.action;
    this.createForm();
  }
  createForm() {
    this.formGroup = this.formBwilder.group({
      check_name: [this.data.check_name, [Validators.required]],
      check_description: [this.data.check_description, [Validators.required]],
      check_status: [this.data.check_status || false],
      check_evidence: [this.data.check_evidence || ''],
      check_evidence_document: [],
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    const check_id = this.data.id;
    this.loading = true;
    this.apiManager.updateComplianceCheck(check_id, data).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });
  }

  deleteComplianceCheck(check_id) {
    this.loading = true;
    this.apiManager.deleteComplianceChecklist(check_id).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.dialogRef.close(res.status);
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}
