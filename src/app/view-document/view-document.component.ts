import {
  Component,
  ViewChild,
  OnInit,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { SharedService } from '../shared.service';
import WebViewer from '@pdftron/webviewer';
import { ApiManagerService } from '../api-manager/api-manager.service';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.css'],
})
export class ViewDocumentComponent implements OnInit, AfterViewInit {
  @ViewChild('viewer', { static: true || false }) viewer: ElementRef;
  sessionStorage = window.sessionStorage;
  doc: any = '';
  sdf: any = '';
  user: any = {};
  DOCUMENT_ID: any = this.shareService.doc_ref.getValue();
  constructor(
    private shareService: SharedService,
    private apiManager: ApiManagerService
  ) {
    this.shareService.DocumentToView.subscribe((pdfDoc) => {
      this.doc = pdfDoc;
    });
  }

  ngOnInit(): void {
    this.user = JSON.parse(sessionStorage.getItem('profile'));
  }

  //save annot to the server
  savexfdfString(xfdfString, annotationId, documentId) {
    const context = this;
    const data = {
      xfdf_string: xfdfString,
      doc_ref: documentId,
      annotation_id: annotationId,
    };

    return new Promise(function (resolve) {
      context.apiManager.saveAnnotsStringToServer(data).subscribe({
        next: (res) => {
          console.log(res);
          resolve('Success');
        },
        error: (err) => console.log(err),
      });
    });
  }

  //setup webviwer
  ngAfterViewInit(): void {
    const context = this;
    WebViewer(
      {
        path: '../../wv-resources/lib/',
        initialDoc: this.doc,
        documentXFDFRetriever: async () => {
          const rows: any = await this.loadxfdfStrings(this.DOCUMENT_ID);
          if (rows) {
            return JSON.parse(rows).map((row) => row.xfdf_string);
          }
        },
      },
      this.viewer.nativeElement
    ).then((instance) => {
      const { UI, Core } = instance;
      const { documentViewer, annotationManager, Tools, Annotations } = Core;
      const UIEvents = UI.Events;
      annotationManager.setCurrentUser(
        this.user.first_name + ' ' + this.user.last_name
      );
      annotationManager.getCurrentUser();

      // Save when annotation change event is triggered (adding, modifying or deleting of annotations)
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
                if (annot.Subject === 'Signature') {
                }
                context.savexfdfString(
                  xfdfStrings,
                  annot.Id,
                  context.DOCUMENT_ID
                );
              });
            } else if (action === 'modify') {
              annots.forEach(function (annot) {
                if (annot.Subject === 'Signature') {
                }
                context.updatexfdfStrings(
                  xfdfStrings,
                  annot.Id,
                  context.DOCUMENT_ID
                );
              });
            } else if (action === 'delete') {
              console.log('there were annotations deleted');
              annots.forEach(function (annot) {
                if (annot.Subject === 'Signature') {
                  console.log('Signature=============>', annot);
                }
                context.deletexfdfStrings(annot.Id);
              });
            }
          });
        }
      );
    });
  }

  //load annots from the server
  loadxfdfStrings(doc_id) {
    const context = this;

    if (doc_id) {
      return new Promise(function (resolve) {
        context.apiManager.getAnnotationsFromServer(doc_id).subscribe({
          next: (res: any) => {
            resolve(JSON.stringify(res));
          },
          error: (err) => {},
        });
      });
    }
  }

  updatexfdfStrings(xfdfStrings, annot_id, DOCUMENT_ID) {
    const context = this;
    const param = {
      xfdf_string: xfdfStrings,
      doc_ref: DOCUMENT_ID,
    };
    const spinner = context.apiManager.startLoading('Updating annotation....');
    return new Promise(function (resolve) {
      context.apiManager.updateAnnotsStringToServer(annot_id, param).subscribe({
        next: (res: any) => {
          resolve(JSON.stringify(res));
          context.apiManager.stopLoading(spinner);
        },
        error: (err) => context.apiManager.stopLoading(spinner),
      });
    });
  }

  deletexfdfStrings(annot_id) {
    const context = this;
    const spinner = context.apiManager.startLoading('Deleting annotation....');
    return new Promise(function (resolve) {
      context.apiManager.deleteAnnotationsFromServer(annot_id).subscribe({
        next: (res: any) => {
          context.apiManager.stopLoading(spinner);
          resolve('deleted');
        },
        error: (err) => context.apiManager.stopLoading(spinner),
      });
    });
  }
}
