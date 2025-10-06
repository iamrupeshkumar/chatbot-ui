import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotModal } from './chatbot-modal';

describe('ChatbotModal', () => {
  let component: ChatbotModal;
  let fixture: ComponentFixture<ChatbotModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
