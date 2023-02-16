import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';

@Component({
  selector: 'app-compliance-creator',
  templateUrl: './compliance-creator.component.html',
  styleUrls: ['./compliance-creator.component.css'],
})
export class ComplianceCreatorComponent implements OnInit {
  formGroup: FormGroup;
  loadingCompliance = false;
  loadingChecks = false;
  complianceId: any = '';
  checkForm: FormGroup;
  constructor(
    private _location: Location,
    private fb: FormBuilder,
    private apiManager: ApiManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.createComplianceForm();
  }

  createComplianceForm() {
    this.formGroup = this.fb.group({
      compliance_name: ['', [Validators.required]],
      compliance_start_date: ['', [Validators.required]],
      compliance_end_date: ['', [Validators.required]],
    });
  }
  onSubmitCompliance(data) {
    const spinner = this.apiManager.startLoading('Saving compliance.....');
    this.apiManager.createCompliance(data).subscribe({
      next: (res: any) => {
        this.apiManager.stopLoading(spinner);
        this.complianceId = res.id;
        this.openSnackBar('Compliance created', 'Close');
        this.startChecklist();
      },
      error: (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }
  startChecklist() {
    this.checkForm = this.fb.group({
      compliance_id: [this.complianceId, [Validators.required]],
      checks: this.fb.array([]),
    });
    this.addCheck();
  }

  addCheck() {
    (this.checkForm.get('checks') as FormArray).push(
      this.fb.group({
        check_name: ['', [Validators.required]],
        check_description: ['', [Validators.required]],
        check_status: [false],
        check_evidence: [''],
        check_evidence_document: [],
      })
    );
  }

  removeCheck(i) {
    (this.checkForm.get('checks') as FormArray).removeAt(i);
  }

  submitChecks(data: any) {
    const param = data;
    if (param.checks.length > 0) {
      const spinner = this.apiManager.startLoading(
        'Saving compliance checks.....'
      );
      this.apiManager.createChecklist(param).subscribe({
        next: (res: any) => {
          this.apiManager.stopLoading(spinner);
          if (res) {
            this.openSnackBar(res.message, 'OK');
            this.back();
          }
        },
        error: (err) => {
          this.openSnackBar('Error on creating checklist', 'OK');
          this.apiManager.stopLoading(spinner);
        },
      });
    }
  }

  back() {
    this._location.back();
  }
  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
