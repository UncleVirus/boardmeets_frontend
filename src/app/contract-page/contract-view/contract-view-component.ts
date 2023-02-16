import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { SharedService } from '../../shared.service';
import { ApiManagerService } from '../../api-manager/api-manager.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

const hostName = window.location.hostname;
@Component({
  selector: 'app-review',
  templateUrl: './contract-view.component.html',
  styleUrls: ['./contract-view.component.css'],
})
export class ContractViewComponent implements OnInit, AfterViewInit {
  sessionStorage = window.sessionStorage;
  allContracts: any = [];
  currentUser: any = {};
  toBeSignedContracts: any = [];
  toBeApprovedContracts: any = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('MatPaginator1', { read: MatPaginator }) paginator1: MatPaginator;
  @ViewChild('MatPaginator2', { read: true }) paginator2: MatPaginator;

  displayedColumns: string[] = [
    'name',
    'parties',
    'start_date',
    'end_date',
    'percentage_approval',
  ];
  allContractsDataSource: any = new MatTableDataSource([]);
  signedContractsDataSource: any = new MatTableDataSource([]);
  approvedContractDataSource: any = new MatTableDataSource([]);
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private sharedService: SharedService,
    private apiManager: ApiManagerService,
    public dialog: MatDialog,
    private _location: Location,
    private http: HttpClient,
    private dialogRef: MatDialogRef<DisplayResponseDialog>
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.sessionStorage.getItem('profile'));
    this.getAllContracts();
    this.getContractsToBeSigned();
    this.getContractsToBeApproved();
  }
  getContractsToBeApproved() {
    this.apiManager.getContractsToBeApproved().subscribe({
      next: (res: any) => {
        this.toBeApprovedContracts = res;
        this.approvedContractDataSource.data = res;

        setTimeout(() => {
          this.approvedContractDataSource.paginator = this.paginator2;
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getContractsToBeSigned() {
    this.apiManager.getContractsToBeSigned().subscribe({
      next: (res: any) => {
        this.toBeSignedContracts = res;
        this.signedContractsDataSource.data = res;

        setTimeout(() => {
          this.signedContractsDataSource.paginator = this.paginator1;
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getAllContracts() {
    const spinner = this.apiManager.startLoading('Loading Contracts .....');
    this.apiManager.getContracts().subscribe({
      next: (res: any) => {
        this.allContracts = res;
        this.allContractsDataSource = new MatTableDataSource(res);
        setTimeout(() => {
          this.allContractsDataSource.paginator = this.paginator;
        });

        this.apiManager.stopLoading(spinner);

        console.log(res);
      },
      error: (err) => {
        this.apiManager.stopLoading(spinner);
        console.log(err);
      },
    });
  }

  openContract(cont_item) {
    const path = '/admin/contract-execution-page';
    const param = {
      contract: this.sharedService.encryptData(cont_item),
    };
    this.sharedService.navigaTo(path, param);
  }
  deleteContract(cont_id) {
    const spinner = this.apiManager.startLoading('Deletig contract.....');
    this.apiManager.deleteContract(cont_id).subscribe({
      next: (res) => {
        console.log(res);
        this.getAllContracts();
        this.apiManager.stopLoading(spinner);
      },
      error: (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }

  ngAfterViewInit() {
    this.allContractsDataSource.paginator = this.paginator;
    this.signedContractsDataSource.paginator = this.paginator1;
    this.approvedContractDataSource.paginator = this.paginator2;
  }
}

@Component({
  selector: 'display-response-dialog',
  templateUrl: 'display-response-dialog.html',
})
export class DisplayResponseDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
