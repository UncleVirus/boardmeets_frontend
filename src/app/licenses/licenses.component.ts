import {
  Component,
  Inject,
  OnDestroy,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { LicensesService } from '../services/licenses.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiManagerService } from '../api-manager/api-manager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.css'],
})
export class LicensesComponent implements OnInit, OnDestroy, AfterViewInit {
  allLicenses: any = [];
  currentUser: any = {};
  sysAdmin = true;
  allactiveLicenses: any = [];
  allinactiveLicenses: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  org_reference_key = '';
  title = '';
  displayedColumns: string[] = [
    'organization',
    'server_id',
    'license_key',
    'license_type',
    'license_expiry_period',
    'number_of_users',
    'isActive',
  ];
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
    private service: LicensesService,
    private dialog: MatDialog,
    public apiManager: ApiManagerService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    if (this.currentUser) {
      this.org_reference_key = this.currentUser?.org_reference_key;
      this.getLicense();
    }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getLicense(): void {
    this.service.getLicenseByOrgRegNo(this.org_reference_key).subscribe(
      (response: any) => {
        this.title = response[0]?.organization?.name;
        this.dataSource = response;
      },
      (error: any) => {
        //this.openSnackBar(error.error?.data, 'CLOSE');
      }
    );
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
