import {
  Component,
  ViewChild,
  OnInit,
  ElementRef,
  AfterViewInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { SharedService } from '../../shared.service';
import WebViewer from '@pdftron/webviewer';
import { ApiManagerService } from '../../api-manager/api-manager.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'contract-signing-viewer',
  templateUrl: './contract-signing.component.html',
  styleUrls: ['./contract-signing.component.css'],
})
export class ContractSigningComponent implements OnInit, AfterViewInit {
  @ViewChild('viewer', { static: true || false }) viewer: ElementRef;

  @Output()
  close = new EventEmitter<boolean>();
  sessionStorage = window.sessionStorage;
  DOCUMENT_ID: any = this.shareService.doc_ref.getValue();
  annotManager: any = '';
  xfdfStrings: any = '';
  doc: any = '';
  instanceObj: any = '';
  user: any = {};
  constructor(
    private shareService: SharedService,
    private apiManager: ApiManagerService,
    private _location: Location,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.shareService.DocumentToView.subscribe({
      next: (res: any) => {
        this.instanceObj = res;
        this.doc = this.instanceObj?.document;
      },
    });
  }

  ngOnInit(): void {
    this.user = JSON.parse(sessionStorage.getItem('profile'));
  }
  onClose() {
    this.close.emit(true);
  }

  //save annot to the server
  savexfdfString(instanceObj, xfdf_string) {
    const context = this;
    const data = {
      sfdf_string: xfdf_string,
    };

    if (!xfdf_string) return;

    if (instanceObj?.doc_ref == this.DOCUMENT_ID) {
      return new Promise(function (resolve) {
        context.apiManager
          .SigningeSignatureDocument(instanceObj?.id, data)
          .subscribe({
            next: (res) => {
              console.log(res);
              context.close.emit(true);
              resolve('Success');
            },
            error: (err) => {
              if (err.error?.details) {
                context.openSnackBar(err.error?.details, 'Close');
              }
            },
          });
      });
    } else {
      return new Promise(function (resolve) {
        context.apiManager
          .SigningContractDocument(instanceObj?.id, data)
          .subscribe({
            next: (res) => {
              console.log(res);
              context.close.emit(true);
              resolve('Success');
            },
            error: (err) => {
              if (err.error?.details) {
                context.openSnackBar(err.error?.details, 'Close');
              }
            },
          });
      });
    }
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }

  //setup webviwer
  ngAfterViewInit(): void {
    const context = this;
    WebViewer(
      {
        path: '../../../wv-resources/lib/',
        initialDoc: this.doc,
        disabledElements: [
          'ribbons',
          'toggleNotesButton',
          'searchButton',
          'menuButton',
          'rubberStampToolGroupButton',
          'stampToolGroupButton',
          'fileAttachmentToolGroupButton',
          'calloutToolGroupButton',
          'undo',
          'redo',
          'eraserToolButton',
        ],
        documentXFDFRetriever: async () => {
          const rows: any = await this.loadxfdfStrings(this.instanceObj?.id);
          if (rows) {
            return rows.map((row) => row.xfdf_string);
          }
        },
      },
      this.viewer.nativeElement
    ).then((instance) => {
      const { UI, Core } = instance;
      const { documentViewer, annotationManager, Tools, Annotations } = Core;
      context.annotManager = annotationManager;
      annotationManager.setCurrentUser(
        this.user.first_name + ' ' + this.user.last_name
      );
      annotationManager.getCurrentUser();

      // select only the insert group
      UI.setToolbarGroup('toolbarGroup-Insert');

      const normalStyles = (widget) => {
        if (widget instanceof Annotations.TextWidgetAnnotation) {
          return {
            'background-color': '#a5c7ff',
            color: 'white',
          };
        } else if (widget instanceof Annotations.SignatureWidgetAnnotation) {
          return {
            border: '1px solid #a5c7ff',
          };
        }
      };

      //event listener
      annotationManager.addEventListener(
        'annotationChanged',
        function (annots, action, options) {
          // If the event is triggered by importing then it can be ignored
          // This will happen when importing the initial annotations from the server or individual changes from other users
          if (options.imported) return;

          annotationManager.exportAnnotCommand().then(function (xfdfStrings) {
            if (action === 'add') {
              console.log('this is a change that added annotations');
              annots.forEach(function (annot) {
                context.xfdfStrings = xfdfStrings;
                if (annot instanceof Annotations.WidgetAnnotation) {
                  Annotations.WidgetAnnotation['getCustomStyles'] =
                    normalStyles;
                  if (!annot.fieldName.startsWith(context.user.email)) {
                    annot.Hidden = true;
                    annot.Listable = false;
                  }
                }
              });
            }
          });
        }
      );
    });
  }

  completeSigning = async () => {
    const xfdf = await this.annotManager.exportAnnotations({
      widgets: false,
      links: false,
    });
    await this.savexfdfString(this.instanceObj, this.xfdfStrings);
  };

  //load annots from the server
  loadxfdfStrings(obj_ref_id) {
    const context = this;

    if (context.instanceObj.doc_ref == this.DOCUMENT_ID) {
      return new Promise(function (resolve) {
        context.apiManager
          .getDocumenteSignatureAnnotation(obj_ref_id)
          .subscribe({
            next: (res: any) => {
              console.log(res);
              resolve(res);
            },
            error: (err) => {},
          });
      });
    } else {
      return new Promise(function (resolve) {
        context.apiManager
          .getDocumentToSignatureAnnotation(obj_ref_id)
          .subscribe({
            next: (res: any) => {
              console.log(res);
              resolve(res);
            },
            error: (err) => {},
          });
      });
    }
  }
}
