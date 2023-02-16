import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignaturePad } from 'angular2-signaturepad';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.css'],
})
export class SignaturePadComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  currentUser: any = {};
  organizations: any = [];
  loading = false;
  enableAttachmentView = false;
  files: File[] = [];
  signatureImg: string;
  @ViewChild(SignaturePad) signaturePad: SignaturePad;

  signaturePadOptions: Object = {
    minWidth: 2,
    canvasWidth: 700,
    canvasHeight: 300,
  };

  constructor(
    public dialogRef: MatDialogRef<SignaturePadComponent>,
    public snackBar: MatSnackBar,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
  }

  ngAfterViewInit() {
    this.signaturePad.set('minWidth', 2);
    this.signaturePad.clear();
  }

  drawComplete() {
    const base64Data = this.signaturePad.toDataURL();
    this.signatureImg = base64Data;
  }

  drawStart() {
    //console.log('begin drawing');
  }

  clearSignature() {
    this.signaturePad.clear();
    this.signatureImg = '';
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  enableAttachment() {
    if (this.enableAttachmentView === false) this.enableAttachmentView = true;
    else this.enableAttachmentView = false;
  }

  //add attachment
  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    if (this.files[0]) {
      const file = this.files[0];

      this.changeFile(file).then((fileBlob: string): any => {
        this.signatureImg = fileBlob;
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
    this.signatureImg = '';
  }

  savePad() {
    this.loading = true;
    const param = {
      user: this.currentUser?.id,
      signature: this.signatureImg,
    };
    this.apiManager.createSignature(param).subscribe(
      (res: any) => {
        this.loading = false;
        console.log(res);
        this.openSnackBar('Signature created successful', 'Close');
        this.dialogRef.close(res);
      },
      (err) => {
        this.loading = false;
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
