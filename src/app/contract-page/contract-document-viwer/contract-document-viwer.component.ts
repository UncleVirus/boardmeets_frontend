import {
  Component,
  ViewChild,
  OnInit,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { SharedService } from '../../shared.service';
import WebViewer from '@pdftron/webviewer';
import { ApiManagerService } from '../../api-manager/api-manager.service';
import { Router } from '@angular/router';

@Component({
  selector: 'contract-document-viwer',
  templateUrl: './contract-document-viwer.component.html',
  styleUrls: ['./contract-document-viwer.component.css'],
})
export class ContractDocumentViwerComponent implements OnInit, AfterViewInit {
  @ViewChild('viewer', { static: true || false }) viewer: ElementRef;
  sessionStorage = window.sessionStorage;

  instance: any = '';
  dropPoint: any = '';
  assignees: any = this.shareService.signatories.getValue();
  assigneesValues: any = [];
  assignee: any = {};

  DOCUMENT_ID: any = this.shareService.doc_ref.getValue() || '';
  instanceObj: any = {};
  doc: any = '';
  user: any = {};

  initialAssignee: any = {};
  constructor(
    private shareService: SharedService,
    private apiManager: ApiManagerService,
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
    //map user email and name to assignvalues
    this.assigneesValues = this.assignees.map((user) => {
      return {
        value: user.email,
        label: user.first_name + ' ' + user.last_name,
      };
    });
    this.initialAssignee =
      this.assigneesValues.length > 0 ? this.assigneesValues[0].value : '';
    this.assignee = this.initialAssignee;
  }
  //setup webviwer
  ngAfterViewInit(): void {
    const context = this;
    WebViewer(
      {
        path: '../../../wv-resources/lib/',
        initialDoc: this.doc,
        fullAPI: true,
        disabledElements: [
          'ribbons',
          'toggleNotesButton',
          'searchButton',
          'menuButton',
        ],
      },
      this.viewer.nativeElement
    ).then((instance) => {
      const { UI, Core } = instance;
      context.instance = instance;
      const { documentViewer, annotationManager, Tools, Annotations } = Core;
      const UIEvents = UI.Events;
      annotationManager.setCurrentUser(
        this.user.first_name + ' ' + this.user.last_name
      );
      annotationManager.getCurrentUser();

      // select only the view group
      UI.setToolbarGroup('toolbarGroup-View');

      const iframeDoc = UI.iframeWindow.document.body;
      iframeDoc.addEventListener('dragover', context.dragOver);
      iframeDoc.addEventListener('drop', (e) => {
        context.drop(e, instance);
      });
    });
  }

  drop = (e, instance) => {
    const { docViewer } = instance;
    const scrollElement = docViewer.getScrollViewElement();
    const scrollLeft = scrollElement.scrollLeft || 0;
    const scrollTop = scrollElement.scrollTop || 0;
    this.dropPoint = { x: e.pageX + scrollLeft, y: e.pageY + scrollTop };
    e.preventDefault();
    return false;
  };

  dragStart = (e) => {
    e.target.style.opacity = 0.5;
    const copy = e.target.cloneNode(true);
    copy.id = 'form-build-drag-image-copy';
    copy.style.width = '250px';
    document.body.appendChild(copy);
    e.dataTransfer.setDragImage(copy, 125, 25);
    e.dataTransfer.setData('text', '');
  };

  dragEnd = (e, type) => {
    this.addField(type, this.dropPoint);
    e.target.style.opacity = 1;
    document.body.removeChild(
      document.getElementById('form-build-drag-image-copy')
    );
    e.preventDefault();
  };

  dragOver = (e) => {
    e.preventDefault();
    return false;
  };

  addField = (type, point = {}, name = '', value = '', flag = {}) => {
    const { docViewer, Annotations } = this.instance;
    const annotManager = docViewer.getAnnotationManager();
    const doc = docViewer.getDocument();
    const displayMode = docViewer.getDisplayModeManager().getDisplayMode();
    const page = displayMode.getSelectedPages(point, point);
    if (!!point && page.first == null) {
      return; //don't add field to an invalid page location
    }
    const page_idx =
      page.first !== null ? page.first : docViewer.getCurrentPage();
    const page_info = doc.getPageInfo(page_idx);
    const page_point = displayMode.windowToPage(point, page_idx);
    const zoom = docViewer.getZoom();

    var textAnnot = new Annotations.FreeTextAnnotation();
    textAnnot.PageNumber = page_idx;
    const rotation = docViewer.getCompleteRotation(page_idx) * 90;
    textAnnot.Rotation = rotation;
    if (rotation === 270 || rotation === 90) {
      textAnnot.Width = 50.0 / zoom;
      textAnnot.Height = 250.0 / zoom;
    } else {
      textAnnot.Width = 250.0 / zoom;
      textAnnot.Height = 50.0 / zoom;
    }
    textAnnot.X = (page_point.x || page_info.width / 2) - textAnnot.Width / 2;
    textAnnot.Y = (page_point.y || page_info.height / 2) - textAnnot.Height / 2;

    textAnnot.setPadding(new Annotations.Rect(0, 0, 0, 0));
    textAnnot.custom = {
      type,
      value,
      flag,
      name: `${this.assignee}_${type}_`,
    };

    // set the type of annot
    textAnnot.setContents(textAnnot.custom.name);
    textAnnot.FontSize = '' + 15.0 / zoom + 'px';
    textAnnot.FillColor = new Annotations.Color(211, 211, 211, 0.5);
    textAnnot.TextColor = new Annotations.Color(0, 165, 228);
    textAnnot.StrokeThickness = 1;
    textAnnot.StrokeColor = new Annotations.Color(0, 165, 228);
    textAnnot.TextAlign = 'center';

    textAnnot.Author = annotManager.getCurrentUser();

    annotManager.deselectAllAnnotations();
    annotManager.addAnnotation(textAnnot, true);
    annotManager.redrawAnnotation(textAnnot);
    annotManager.selectAnnotation(textAnnot);
  };

  applyFields = async () => {
    const { Annotations, docViewer } = this.instance;
    const annotManager = docViewer.getAnnotationManager();
    const fieldManager = annotManager.getFieldManager();
    const annotationsList = annotManager.getAnnotationsList();
    const annotsToDelete = [];
    const annotsToDraw = [];

    await Promise.all(
      annotationsList.map(async (annot, index) => {
        let inputAnnot;
        let field;

        if (typeof annot.custom !== 'undefined') {
          // create a form field based on the type of annotation
          if (annot.custom.type === 'TEXT') {
            field = new Annotations.Forms.Field(
              annot.getContents() + Date.now() + index,
              {
                type: 'Tx',
                value: annot.custom.value,
              }
            );
            inputAnnot = new Annotations.TextWidgetAnnotation(field);
          } else if (annot.custom.type === 'SIGNATURE') {
            field = new Annotations.Forms.Field(
              annot.getContents() + Date.now() + index,
              {
                type: 'Sig',
              }
            );
            inputAnnot = new Annotations.SignatureWidgetAnnotation(field, {
              appearance: '_DEFAULT',
              appearances: {
                _DEFAULT: {
                  Normal: {
                    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC',
                    offset: {
                      x: 100,
                      y: 100,
                    },
                  },
                },
              },
            });
          } else {
            // exit early for other annotations
            annotManager.deleteAnnotation(annot, false, true); // prevent duplicates when importing xfdf
            return;
          }
        } else {
          // exit early for other annotations
          return;
        }

        // set position
        inputAnnot.PageNumber = annot.getPageNumber();
        inputAnnot.X = annot.getX();
        inputAnnot.Y = annot.getY();
        inputAnnot.rotation = annot.Rotation;
        if (annot.Rotation === 0 || annot.Rotation === 180) {
          inputAnnot.Width = annot.getWidth();
          inputAnnot.Height = annot.getHeight();
        } else {
          inputAnnot.Width = annot.getHeight();
          inputAnnot.Height = annot.getWidth();
        }

        // delete original annotation
        annotsToDelete.push(annot);

        // customize styles of the form field
        Annotations.WidgetAnnotation.getCustomStyles = function (widget) {
          if (widget instanceof Annotations.SignatureWidgetAnnotation) {
            return {
              border: '1px solid #a5c7ff',
            };
          }
        };
        Annotations.WidgetAnnotation.getCustomStyles(inputAnnot);

        // draw the annotation the viewer
        annotManager.addAnnotation(inputAnnot);
        fieldManager.addField(field);
        annotsToDraw.push(inputAnnot);
      })
    );

    // delete old annotations
    annotManager.deleteAnnotations(annotsToDelete, null, true);

    // refresh viewer
    await annotManager.drawAnnotationsFromList(annotsToDraw);
    await this.uploadForSigning();
  };

  uploadForSigning = async () => {
    // upload the PDF with fields as AcroForm
    const { docViewer, annotManager } = this.instance;
    const doc = docViewer.getDocument();

    const xfdfString = await annotManager.exportAnnotations({
      widgets: true,
      fields: true,
    });

    await this.addDocumentToSign(xfdfString, this.instanceObj);
  };

  addDocumentToSign(xfdfString, instanceObj) {
    const param = {
      xfdfString: xfdfString,
    };
    if (!xfdfString) return;
    const spinner = this.apiManager.startLoading('Updating contract document');

    if (this.DOCUMENT_ID == instanceObj?.doc_ref) {
      //apply changes on eSignature document
      this.apiManager
        .createDocumenteSignaturePlacement(instanceObj?.id, param)
        .subscribe({
          next: (res) => {
            this.apiManager.stopLoading(spinner);
            this.router.navigate(['../admin/actions/signature']);
          },
          error: (err) => {
            console.log(err);
            this.apiManager.stopLoading(spinner);
          },
        });
    } else {
      //apply changes on contract document
      this.apiManager.addDocumentToSign(instanceObj?.id, param).subscribe({
        next: (res) => {
          console.log(res);

          this.apiManager.stopLoading(spinner);
          this.router.navigate(['../admin/contract-page']);
        },
        error: (err) => {
          console.log(err);
          this.apiManager.stopLoading(spinner);
        },
      });
    }
  }
}
