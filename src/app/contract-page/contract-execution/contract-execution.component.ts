import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartType, ChartOptions } from 'chart.js';
import {
  SingleDataSet,
  Label,
  monkeyPatchChartJsLegend,
  monkeyPatchChartJsTooltip,
} from 'ng2-charts';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-contract-execution',
  templateUrl: './contract-execution.component.html',
  styleUrls: ['./contract-execution.component.css'],
})
export class ContractExecutionComponent implements OnInit {
  viewContract = false;
  sessionStorage = window.sessionStorage;
  currentUser: any = {};
  contractObj: any = {};
  signatureObj: any = [];
  actionsObj: any = {};
  signedDoc = false;
  users: any = [];
  contractFeedbackObj: any = [];
  displayedColumns: string[] = ['member', 'feedback', 'status'];
  dataSource = new MatTableDataSource([]);

  //pie config

  public pieChartOptions: ChartOptions = { responsive: true };
  public lineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };
  public pieChartLabels: Label[] = [['Total signers'], ['Have signed']];
  public pieChartData: SingleDataSet = [0, 0];
  public pieChartType: ChartType = 'pie';

  public pieChartLabels_: Label[] = [
    ['Analytics'],
    ['Total approvers'],
    ['Have approved'],
  ];
  public pieChartData_: SingleDataSet = [0, 0];
  public pieChartType_: ChartType = 'bar';

  public pieChartLegend = true;
  public pieChartPlugins = [];

  constructor(
    private sharedService: SharedService,
    public _location: Location,
    private apiManager: ApiManagerService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    //pie
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
    this._route.params.subscribe((params) => {
      if (params['contract']) {
        this.contractObj = this.sharedService.decryptData(params['contract']);
      } else this._location.back();
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.sessionStorage.getItem('profile'));
    this.getAllUsers();

    this.getContractSignatures();
    this.getContractActions();
    this.getContractFeedback();
  }
  getContractFeedback() {
    this.apiManager.getContractFeedback(this.contractObj?.id).subscribe({
      next: (res: any) => {
        this.contractFeedbackObj = res;
        this.dataSource = new MatTableDataSource(res);
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteContractFeedback(feedback_id) {
    this.apiManager.deleteContractFeedback(feedback_id).subscribe({
      next: (res) => {
        this.getContractFeedback();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  openContractDialog(cont_item): void {
    const data = {
      users: this.users,
      cont_item: cont_item,
    };
    const dialogRef = this.dialog.open(DialogEditContractDialog, {
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
        this.openSnackBar('Contract updated successfull. ', 'Close');
        this._location.back();
      }
    });
  }

  openCreateContractFeedbackDialog(): void {
    const data = {
      contractId: this.contractObj?.id,
    };
    const dialogRef = this.dialog.open(DialogCreateContractFeedbackDialog, {
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
        this.getContractFeedback();
      }
    });
  }

  openContractDocument(contractObj, status = false) {
    this.sharedService.doc_ref.next('');
    this.sharedService.signatories.next(contractObj?.signatories);
    this.sharedService.DocumentToView.next(contractObj);

    if (status) {
      this.signedDoc = true;
    } else this.viewContract = true;
  }

  getAllUsers() {
    this.apiManager.getAllUsers().subscribe({
      next: (res) => (this.users = res),
    });
  }

  takeAction(action) {
    const param = {
      contract_id: this.contractObj?.id,
      action_taker: this.currentUser?.id,
      action_done: action,
    };
    console.log(param);

    this.apiManager.contractRejectOrApprove(param).subscribe({
      next: (res) => {
        console.log(res);
        this.openSnackBar('Action has been taken successful. ', 'Close');
        this.getContractActions();
      },
      error: (err) => {
        if (err.error?.status) {
          this.openSnackBar(err.error.message, 'Close');
        }
      },
    });
  }

  getContractSignatures() {
    this.apiManager
      .getContractSignatureAnalytics(this.contractObj?.id)
      .subscribe({
        next: (res: any) => {
          console.log('signatures', res);
          this.signatureObj = res.res;

          this.pieChartData = [res.signatories_count, res.signed_count];
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  getContractActions() {
    const spinner = this.apiManager.startLoading('Getting actions....');
    this.apiManager.getContractActions(this.contractObj?.id).subscribe({
      next: (res: any) => {
        this.actionsObj = res.res;
        console.log(res);
        this.pieChartData_ = [0, res.approval_count, res.approved_count];
        this.apiManager.stopLoading(spinner);
      },
      error: (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}

@Component({
  selector: 'dialog-edit-contract-dialog',
  templateUrl: 'dialog-edit-contract-dialog.html',
  styleUrls: ['./contract-execution.component.css'],
})
export class DialogEditContractDialog {
  formGroup: FormGroup;
  loading = false;
  users: any = [];
  cont_item: any = [];
  fileUrl = '';
  files: File[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogEditContractDialog>,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.users = this.data.users;
    this.cont_item = this.sortItem({ ...this.data.cont_item });
    if (this.cont_item) {
      this.createForm();
    }
  }
  createForm() {
    this.formGroup = this.formBwilder.group({
      contract_title: [this.cont_item?.contract_title, [Validators.required]],
      description: [this.cont_item.description, [Validators.required]],
      parties: [this.cont_item.parties, [Validators.required]],
      permission: [this.cont_item.permission || ''],
      approvers: [this.cont_item.approvers, [Validators.required]],
      signatories: [this.cont_item.signatories, [Validators.required]],
      end_date_time: [this.cont_item.end_date_time, [Validators.required]],
      start_date_time: [this.cont_item.start_date_time, [Validators.required]],
      created_by: [this.cont_item?.created_by.id, [Validators.required]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    const item_id = this.cont_item.id;
    if (this.fileUrl) data['document'] = this.fileUrl;
    this.loading = true;
    this.apiManager.updateContract(item_id, data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });
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
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
    this.fileUrl = '';
  }

  sortItem(obj) {
    obj['permission'] = this.getUserIds(obj['permission']);
    obj['approvers'] = this.getUserIds(obj['approvers']);
    obj['signatories'] = this.getUserIds(obj['signatories']);
    return obj;
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

@Component({
  selector: 'dialog-create-contract-feedback-dialog',
  templateUrl: 'dialog-create-contract-feedback-dialog.html',
  styleUrls: ['./contract-execution.component.css'],
})
export class DialogCreateContractFeedbackDialog {
  formGroup: FormGroup;
  loading = false;
  files: File[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogEditContractDialog>,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.createForm();
  }
  createForm() {
    this.formGroup = this.formBwilder.group({
      title: ['', [Validators.required]],
      comment: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    this.apiManager
      .createContractFeedback(this.data?.contractId, data)
      .subscribe({
        next: (res) => {
          console.log(res);
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
