import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ChatService } from './chat/service/chat.service';
import { ApiManagerService } from './api-manager/api-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  message: any = null;
  sessionStorage = sessionStorage;
  constructor(
    private _router: Router,
    private service: ChatService,
    private api_manager: ApiManagerService
  ) {}

  ngOnInit(): void {
    this.requestPermission();
    this.listen();
  }

  requestPermission() {
    const messaging = getMessaging();
    getToken(messaging, { vapidKey: environment.firebase.vapidKey })
      .then((currentToken) => {
        if (currentToken) {
          const data = { registration_id: currentToken };
          this.sessionStorage.setItem('device', JSON.stringify(data));
        } else {
          console.log(
            'No registration token available. Request permission to generate one.'
          );
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
      });
  }

  listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);

      this.message = payload;
      this.service.notifyMe(
        this.message.notification?.title,
        this.message.notification?.body
      );
    });
  }
}
