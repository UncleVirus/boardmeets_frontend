import { Location } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-compliance-page',
  templateUrl: './compliance-page.component.html',
  styleUrls: ['./compliance-page.component.css'],
})
export class CompliancePageComponent implements OnInit, AfterViewInit {
  sessionStorage = window.sessionStorage;
  currentUser: any = {};
  complianceObj: any = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['name', 'score', 'start_date', 'end_date'];
  dataSource: any = new MatTableDataSource([]);
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private router: Router,
    private _location: Location,
    private apiManager: ApiManagerService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.sessionStorage.getItem('profile'));
    this.getCompliances();
  }
  getCompliances() {
    const spinner = this.apiManager.startLoading('Loading Compliances.....');
    this.apiManager.getCompliance().subscribe({
      next: (res: any) => {
        this.apiManager.stopLoading(spinner);
        this.complianceObj = res;
        console.log(res);
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        this.apiManager.stopLoading(spinner);
        console.log(err);
      },
    });
  }
  openCompliance(compliance) {
    const path = '/admin/compliance-view';
    const param = {
      compliance: this.sharedService.encryptData(compliance),
    };
    this.sharedService.navigaTo(path, param);
  }

  deleteCompliance(compliance_id) {
    this.apiManager.deleteCompliance(compliance_id).subscribe({
      next: (res) => this.getCompliances(),
      error: (err) => console.log(err),
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
