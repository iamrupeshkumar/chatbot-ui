import { Component, EventEmitter, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot-modal',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './chatbot-modal.html',
  styleUrl: './chatbot-modal.css'
})
export class ChatbotModal {
  close = output<void>();
  dismiss() {
    this.close.emit();
  }
}
