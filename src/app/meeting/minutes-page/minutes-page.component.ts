import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-minutes-page',
  templateUrl: './minutes-page.component.html',
  styleUrls: ['./minutes-page.component.css'],
})
export class MinutesPageComponent implements OnInit {
  minutesObj: any = {};
  public image =
    '../../../assets/images/Coseke-Logo-Quality-means-no-compromise.jpg';

  @ViewChild('minutePage') minutePage!: ElementRef;
  constructor(
    private _route: ActivatedRoute,
    public _location: Location,
    public sharedService: SharedService,
    private apiManager: ApiManagerService
  ) {
    this._route.params.subscribe((params) => {
      if (params['minute']) {
        this.minutesObj = this.sharedService.decryptData(params['minute']);
        console.log(this.minutesObj);
      } else this._location.back();
    });
  }

  ngOnInit(): void {}

  deleteMinutes(minute_id) {
    this.apiManager.deleteMeetingMinute(minute_id).subscribe({
      next: (res) => this._location.back(),
      error: (err) => console.log(err),
    });
  }

  changeFileToblob() {}

  downloadMinute() {
    const minuteRef = this.minutePage.nativeElement;
    this.sharedService.downloadAsPDF(minuteRef);
  }
}
