import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ApiManagerService } from './api-manager/api-manager.service';
import * as CryptoJS from 'crypto-js';
import { Router } from '@angular/router';

declare var require: any;

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
const htmlToPdfmake = require('html-to-pdfmake');
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private titleEvent = new Subject<any>();
  public currentDocId: BehaviorSubject<number> = new BehaviorSubject<number>(
    null
  );
  public action: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public DocumentToView: BehaviorSubject<any> = new BehaviorSubject<any>('');
  public doc_ref: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public approvalContractNo: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  public AllContractsNo: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );
  public meetingObj: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public surveyObj: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public eSignatureObj: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public zoomOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public contractDetails: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public zoomObj: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public votingDetails: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public signatories: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public complianceObj: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public actionVoting: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  constructor(private apiManager: ApiManagerService, private router: Router) {}

  sendTitleEvent(title: string) {
    this.titleEvent.next({ title: title });
  }

  getTitleEvent(): Observable<any> {
    return this.titleEvent.asObservable();
  }

  public navigaTo(path, data) {
    this.router.navigate([path, data]);
  }

  public encryptData(data) {
    try {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        'this.encryptSecretKey'
      ).toString();
    } catch (e) {
      console.log(e);
    }
  }

  public decryptData(data) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, 'this.encryptSecretKey');
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  public getBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase();
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }

  public downloadAsPDF(elementRef: any) {
    var html = htmlToPdfmake(elementRef.innerHTML);
    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).download();
  }
}
