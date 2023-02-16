import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-spinner-view',
  templateUrl: './spinner-view.component.html',
  styleUrls: ['./spinner-view.component.css'],
})
export class SpinnerViewComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SpinnerViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}
}
