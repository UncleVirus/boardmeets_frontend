import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-shimmer',
  templateUrl: './loading-shimmer.component.html',
  styleUrls: ['./loading-shimmer.component.scss'],
})
export class LoadingShimmerComponent implements OnInit {
  title = 'shimmer-loading';
  constructor() {}

  ngOnInit(): void {}
}
