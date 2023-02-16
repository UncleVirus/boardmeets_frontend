import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';
import { ChartType, ChartOptions } from 'chart.js';
import {
  SingleDataSet,
  Label,
  monkeyPatchChartJsLegend,
  monkeyPatchChartJsTooltip,
} from 'ng2-charts';

@Component({
  selector: 'app-signature-view-page',
  templateUrl: './signature-view-page.component.html',
  styleUrls: ['./signature-view-page.component.css'],
})
export class SignatureViewPageComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  currentUser: any = {};
  formGroup: FormGroup;
  viewDocument = false;
  eSignatureAnalytics: any = [];
  signedDoc = false;
  eSignatureObj: any = {};

  //pie config

  public pieChartOptions: ChartOptions = { responsive: true };

  public pieChartLabels: Label[] = [['Total signers'], ['Have signed']];
  public pieChartData: SingleDataSet = [0, 0];
  public pieChartType: ChartType = 'pie';
  constructor(
    private _formBuilder: FormBuilder,
    public _location: Location,
    private apiManager: ApiManagerService,
    private router: Router,
    private sharedService: SharedService,
    private _route: ActivatedRoute
  ) {
    //pie
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
    this._route.params.subscribe((params) => {
      if (params['signature']) {
        this.eSignatureObj = this.sharedService.decryptData(
          params['signature']
        );
      } else this._location.back();
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.geteSignatureAnalytics();

    this.createForm();
    console.log(this.eSignatureObj);
  }

  geteSignatureAnalytics() {
    this.apiManager
      .getDocumentESignatureAnalytics(this.eSignatureObj?.id)
      .subscribe({
        next: (res: any) => {
          console.log('data', res);
          this.eSignatureAnalytics = res?.result;
          this.pieChartData = [res?.eSigners_count, res.eSigned_count];
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  createForm() {
    this.formGroup = this._formBuilder.group({
      signature_title: [
        this.eSignatureObj?.signature_title,
        Validators.required,
      ],
      open_date: [this.eSignatureObj?.open_date, Validators.required],
      close_date: [this.eSignatureObj?.close_date, Validators.required],
      description: [this.eSignatureObj?.description, Validators.required],
    });
    this.formGroup.disable();
  }
  openDestinationFolder(folder) {
    console.log(folder);
    this.router.navigate([
      '/admin/resources-page',
      {
        folderId: folder.id,
        name: folder.name,
      },
    ]);
  }

  openSignatureDoc(documentObj, status = false) {
    this.sharedService.doc_ref.next(documentObj?.doc_ref);
    this.sharedService.signatories.next(documentObj?.signers);
    this.sharedService.DocumentToView.next(documentObj);

    if (status) {
      this.signedDoc = true;
    } else this.viewDocument = true;
  }
}
