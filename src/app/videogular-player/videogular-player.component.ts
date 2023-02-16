import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-videogular-player',
  templateUrl: './videogular-player.component.html',
  styleUrls: ['./videogular-player.component.css'],
})
export class VideogularPlayerComponent implements OnInit {
  videoSrc: string = '';
  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.sharedService.DocumentToView.subscribe((pdfDoc) => {
      this.videoSrc = pdfDoc;
    });
  }
}
