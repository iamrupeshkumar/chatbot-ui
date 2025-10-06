import { Component } from '@angular/core';
//import { ChatButton } from '../essentials/chat-button/chat-button';
import { FloatingChat } from "../essentials/floating-chat/floating-chat";

@Component({
  selector: 'app-dashboard',
  imports: [FloatingChat],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

}
