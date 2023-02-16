import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  webSocket: WebSocket;
  public chatMessages: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  audio: BehaviorSubject<any> = new BehaviorSubject(null);
  //ws_root = '127.0.0.1:8000/ws/chat/';
  ws_root = 'api.cosekeeboard.com/ws/chat/';

  constructor(private apiManager: ApiManagerService, private router: Router) {
    let ws_protocal = 'wss://';

    if (window.location.protocol === 'https:') {
      ws_protocal = 'wss://';
    } else {
      ws_protocal = 'ws://';
    }

    this.ws_root = `${ws_protocal}${this.ws_root}`;
  }

  public connect(chat_id, logged_in_user) {
    const spinner = this.apiManager.startLoading();
    this.webSocket = new WebSocket(`${this.ws_root}${chat_id}/`);

    this.webSocket.onopen = (event) => {
      this.chatMessages.next([]);
      this.fetchMessages(chat_id, logged_in_user);
    };
    this.webSocket.onmessage = (event: any) => {
      this.apiManager.stopLoading(spinner);
      this.socketNewMessage(event.data);
    };

    this.webSocket.onerror = (event: any) => {
      this.apiManager.stopLoading(spinner);
      this.disconnect();
    };

    this.webSocket.onclose = (event) => {
      this.apiManager.stopLoading(spinner);
      console.log('event_close', event);
    };
  }
  public state() {
    return this.webSocket.readyState;
  }

  public disconnect() {
    this.webSocket.close();
  }

  public socketNewMessage(data) {
    const parseData = JSON.parse(data);
    const command = parseData.command;

    if (command === 'messages') {
      const messages = parseData.messages;
      this.chatMessages.next(messages);
      console.log('...........', this.chatMessages);
    }
    if (command === 'new_message') {
      const message = parseData.message;
      this.chatMessages.next([...this.chatMessages.value, message]);
      this.notifyMe(message.author, message.content);
      return;
    }
  }

  public fetchMessages(chat_id, logged_in_user) {
    const param = {
      command: 'fetch_messages',
      chatId: chat_id,
      fromUser: logged_in_user,
      number_of_chats: 20,
    };
    this.sendMessage(param);
  }

  public newChatMessage(data: any) {
    const param = {
      command: 'new_message',
      from: data.from,
      message: data.content,
      chatId: data.chat_id,
    };
    this.sendMessage(param);
  }

  public sendMessage(data: any) {
    const msg = JSON.stringify(data);
    try {
      this.webSocket.send(msg);
    } catch (e) {
      console.log(e.message);
    }
  }

  sendNotification(title, message) {
    const notify = new Notification(title, {
      body: message,
      icon: './../../../assets/images/chat_black_24dp.svg',
    });
    notify.onclick = (event) => {
      event.preventDefault();
      window.open(this.router.url, '_blank');
    };
  }

  notifyMe(title: string, message: string) {
    if (!(window as any).Notification) {
      console.log('Browser does not support notifications.');
    } else {
      if (Notification.permission === 'granted') {
        this.sendNotification(title, message);
      } else {
        Notification.requestPermission()
          .then(function (p) {
            if (p === 'granted') {
              this.sendNotification(title, message);
            } else {
              console.log('User blocked notifications.');
            }
          })
          .catch(function (err) {
            console.error(err);
          });
      }
    }

    if (this.audio.value === null || this.audio.value === undefined) {
      this.audio.next(
        new Audio('./../../../assets/docs/mixkit-message-pop-alert-2354.mp3')
      );
      this.audio.value.loop = false;
      this.audio.value.play();
    }
  }
}
