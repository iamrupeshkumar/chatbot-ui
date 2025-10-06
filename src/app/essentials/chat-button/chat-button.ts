import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { ChatbotModal } from '../chatbot-modal/chatbot-modal';
import { FloatingChat } from '../floating-chat/floating-chat';

@Component({
  selector: 'app-chat-button',
  imports: [CommonModule,FloatingChat],
  templateUrl: './chat-button.html',
  styleUrl: './chat-button.css'
})
export class ChatButton {
  isOpen = signal(false);

  toggleModal() {
    this.isOpen.update(open => !open);
  }
}
