import {
  Component,
  ViewChild,
  OnInit,
  ElementRef,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { SharedService } from '../shared.service';
import WebViewer from '@pdftron/webviewer';
import { ApiManagerService } from '../api-manager/api-manager.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-signed-document',
  templateUrl: './view-signed-document.component.html',
  styleUrls: ['./view-signed-document.component.css'],
})
export class ViewSignedDocumentComponent implements OnInit, AfterViewInit {
  @ViewChild('viewer', { static: true || false }) viewer: ElementRef;
  @Output()
  close = new EventEmitter<boolean>();

  sessionStorage = window.sessionStorage;
  DOCUMENT_ID: any = this.shareService.doc_ref.getValue();
  instance: any = '';
  xfdfStrings: any = '';
  doc: any = '';
  instanceObj: any = '';
  user: any = {};
  constructor(
    private shareService: SharedService,
    private apiManager: ApiManagerService,
    private _location: Location,
    private router: Router
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
      context.instance = instance;
      const { UI, Core } = instance;
      const { documentViewer, annotationManager, Tools, Annotations } = Core;
      annotationManager.setCurrentUser(
        this.user.first_name + ' ' + this.user.last_name
      );
      annotationManager.getCurrentUser();

      // select only the insert group
      UI.setToolbarGroup('toolbarGroup-View');

      //event listener
      annotationManager.addEventListener(
        'annotationChanged',
        function (annots, action, options) {}
      );
    });
  }

  download = () => {
    this.instance.downloadPdf(true);
  };

  //load annots from the server
  loadxfdfStrings(obj_ref_id) {
    const context = this;

    if (context.instanceObj?.doc_ref == this.DOCUMENT_ID) {
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
