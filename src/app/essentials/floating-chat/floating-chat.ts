import { Component, computed, signal, effect, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { UserService } from '../../services/userService';
import { User } from '../../models/user';
import { switchMap } from 'rxjs';
import { Message } from '../../models/message'; // Assuming you have a Message model defined
import { BotMessage } from '../../models/bot-message';

@Component({
  selector: 'app-floating-chat',
  imports: [CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatInputModule, 
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinner],
  templateUrl: './floating-chat.html',
  styleUrl: './floating-chat.css',
  standalone: true,
})

export class FloatingChat implements AfterViewChecked {

  @ViewChild('bottom') private bottomRef!: ElementRef;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom():void {
    try {
      this.bottomRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {}
  }



  isOpen = signal(false);

  steps = signal(1);
  protected loading = signal(false);

  lastDistrictId : number | null = null;
  lastVCType: string | null = null;
  lastVCId: number | null = null;
  lastTalukaId: number | null = null;

  constructor(private userService: UserService) {
    
    effect(() => {
      console.log('Selected district Id :', this.selectedDistrictId());
      const dname = this.districts().find(d => d.dis_id === this.selectedDistrictId());
      if (dname && this.selectedDistrictId() !== this.lastDistrictId) {
        this.lastDistrictId = this.selectedDistrictId();
        this.selectedDistrict.set(dname.dis_name);
        this.talukas.set([]); // Reset talukas when district changes
        this.selectedVillCityType.set(''); // Reset village/city type
        this.getTalukas();
        console.log('Selected district name:', dname.dis_name);
      } else {
        console.log('No district selected or not found');
      }

      const talukaId = this.selectedTalukaId();
      if (talukaId && talukaId !== this.lastTalukaId) {
        this.lastTalukaId = talukaId;
        this.selectedTaluka.set(this.talukas().find(t => t.taluka_id === talukaId)?.taluka_name || '');
        this.villagesCities.set([]); // Reset villages/cities when taluka changes
        this.selectedVillCityType.set(''); // Reset village/city type
        this.municipalities.set([]); // Reset municipalities when village/city changes
        this.getVillagesCities();
      }

      const type = this.selectedVillCityType();
      if (type && type !== this.lastVCType) {
        this.lastVCType = type;
        this.selectedMunicipalitiesType.set(type === 'Village' ? 'Panchayat' : 'Municipal');
        this.villagesCities.set([]); // Reset villages/cities when type changes
        this.municipalities.set([]); // Reset municipalities when village/city changes
        this.getVillagesCities();
      }

      const vcId = this.selectedVillCityId();
      if (vcId && vcId !== this.lastVCId) {
        this.lastVCId = vcId;
        this.villageCity.set(this.villagesCities().find(vc => vc.village_city_id === vcId)?.village_city_name || '');
        this.municipalities.set([]); // Reset municipalities when village/city changes
        this.getMunicipalities();
      }

      const selectedMunicipalitiesId = this.selectedMunicipalitiesId();
      if (selectedMunicipalitiesId) {
        const municipality = this.municipalities().find(m => m.municipal_gp_id === selectedMunicipalitiesId);
        if (municipality) {
          this.selectedMunicipalities.set(municipality.municipal_gp_name);
        } else {
          this.selectedMunicipalities.set('');
        }
      }

      console.log('User Dara:', this.userData());

    });
  }


  ngOnInit() : void {
    this.initializingForm();
  }

  initializingForm(){

    this.userEmail.set('');
    this.userId.set('');
    this.selectedDistrictId.set(0);
    this.selectedDistrict.set('');
    this.selectedTaluka.set('');
    this.selectedTalukaId.set(0);
    this.selectedVillCityType.set(''); // 'village' or 'city'
    this.selectedVillCityId.set(0);
    this.villageCity.set('');
    this.selectedMunicipalitiesId.set(0);
    this.selectedMunicipalities.set('');
    this.selectedMunicipalitiesType.set(''); // 'gp' or 'muncipal'
    
    // Reset signals
    this.districts.set([]);
    this.talukas.set([]);
    this.villagesCities.set([]);
    this.municipalities.set([]);

  this.lastDistrictId = null;
  this.lastVCType = null;
  this.lastVCId = null;
  this.lastTalukaId = null;
  }

  protected userEmail = signal('');
  protected userId = signal('');
  protected selectedDistrictId = signal(0);
  protected selectedDistrict = signal('');
  protected selectedTaluka = signal('');
  protected selectedTalukaId = signal(0);
  protected selectedVillCityType = signal(''); // 'village' or 'city'
  protected selectedVillCityId = signal(0);
  protected villageCity = signal('');
  protected selectedMunicipalitiesId = signal(0);
  protected selectedMunicipalities = signal('');
  protected selectedMunicipalitiesType = signal(''); // 'gp' or 'muncipal'
  
  
  userData = computed<User>(() => ({
    email: this.userEmail().trim(),
    user_id: this.userId(), //
    district: this.selectedDistrict().trim(), //
    district_id: this.selectedDistrictId(),
    taluka: this.selectedTaluka().trim(), //
    taluka_id: this.selectedTalukaId(),
    type: this.selectedVillCityType().trim(),
    village_city_id: this.selectedVillCityId(),
    village_city: this.villageCity().trim(), //
    municipal_gp_type: this.selectedMunicipalitiesType().trim(),
    municipal_corp: this.selectedMunicipalities().trim() //
  }));

  message = computed<Message>(() => ({
    email: this.userEmail().trim(),
    user_id: this.userId(),
    sender: 'user',
    query_text: this.userInput().trim()
  }));

  formSubmitted() {
    this.loading.set(true);
    if (!this.userEmail().trim() || !this.selectedDistrict() || !this.selectedTaluka() 
      || !this.villageCity() || !this.selectedMunicipalities() || !this.userId()) {
      console.error('All fields are required');
      this.loading.set(false);
      return;
    }

    this.userService.submitUserData(this.userData()).subscribe({
      next: (response) => { 
        this.userId.set(response.user_id || '');
        console.log('User data submitted successfully:', response);
        console.log('res user_id:', response.user_id);
        console.log("this.userId.set(response.user_id || '') : ", this.userId());
        this.loading.set(false);
        this.steps.update(step => step + 1);
        const botMessage: BotMessage = {message:'Hello! How can I assist you today?', buttons:[]};
        this.messages.update(msgs => [
            ...msgs,
            {
              sender: 'bot',
              text: botMessage.message || '',
              buttons: botMessage.buttons || []
            }
          ]);
      },
      error: (error) => { 
        console.error('Error submitting user data:', error);
        this.loading.set(false);
      }
    });
  }

  submitEmail2(){
    this.loading.set(true);
    if (!this.userEmail().trim()){
      console.error('Email is required');
      this.loading.set(false);
      return;
    }
    // call API
    this.userService.submitEmail(this.userData()).pipe(
      switchMap((response) => {
        this.userId.set(response.user_id || '');
        this.steps.update(step => step + 1);
        return this.userService.getDistricts();
      })
    ).subscribe({
      next: (response) => {
        console.log('Email submitted successfully:', response);
        this.loading.set(false);
        console.log('Signal userData:', this.userData());
        // Update districts after email submission
        this.districts.set(response.districts || []);
      },
      error: (error) => {
        console.error('Error submitting email:', error);
        this.loading.set(false);
      }
    });
  }

  submitEmail() {
    this.loading.set(true);
    if (!this.userEmail().trim()){
      console.error('Email is required');
      this.loading.set(false);
      return;
    }
    // call API
    //const payload = { email:this.userEmail().trim() };
    this.userService.submitEmail(this.userData()).subscribe({
      next: (response) => {
        this.userId.set(response.user_id || '');
        this.steps.update(step => step + 1);
        console.log('Email submitted successfully:', response);
        this.loading.set(false);
        console.log('Signal userData:', this.userData());
        // Optionally, fetch districts after email submission
        this.getDistricts();
      },
      error: (error) => {
        console.error('Error submitting email:', error);
        this.loading.set(false);
      }
    });
  }

  protected districts = signal<{dis_id:number,dis_name:string}[]>([]);
  getDistricts() {
    // call API to get districts
    this.userService.getDistricts().subscribe({
      next: (response) => {
        console.log('Districts fetched successfully:', response);
        this.districts.set(response.district_names || []);
      },
      error: (error) => { 
        console.error('Error fetching districts:', error);
      }
    });
  }

  protected talukas = signal<{taluka_id:number,taluka_name:string}[]>([]);
  getTalukas() {
    this.userService.getTalukas(this.userData()).subscribe({
          next: (response) => {
            console.log('Talukas fetched successfully:', response);
            this.talukas.set(response.talukas || []);
          },
          error: (error) => {
            console.error('Error fetching talukas:', error);
          }
      });
  }

  protected villagesCities = signal<{village_city_id:number,village_city_name:string}[]>([]);
  getVillagesCities() {
    this.userService.getVillagesCities(this.userData()).subscribe({
      next: (response) => {
        console.log('Villages/Cities fetched successfully:', response);
        this.villagesCities.set(response.village_city || []);
      },
      error: (error) => {
        console.error('Error fetching villages/cities:', error);
      }
    });
  }

  protected municipalities = signal<{municipal_gp_id:number,municipal_gp_name:string}[]>([]);
  getMunicipalities() {
    this.userService.getMunicipalities(this.userData()).subscribe({
      next: (response) => {
        console.log('Municipalities fetched successfully:', response);
        this.municipalities.set(response.municipal_gp || []);
      },
      error: (error) => {
        console.error('Error fetching municipalities:', error);
      }
    });
  }


  protected messages = signal<{ sender: 'user' | 'bot'; text: string; buttons?: string[]; typing?:boolean, fileName?:string; fileBlobUrl?: string; }[]>([]);
  protected userInput = signal('');

//   sendMessage() {
//     const text = this.userInput().trim();
//     if (!text) return;

//     // Push user message to chat
//     this.messages.update(msgs => [...msgs, { sender: 'user', text }]);

//     // Clear input
//     this.userInput.set('');

//     const payload: Message = {
//       user_id: this.userId(),  // assuming you already have userId signal
//       query_text: text,
//       email: this.userEmail()  // optional
//     };

//     // Call chatbot API
//     this.userService.askBot(payload).subscribe({
//   next: (res: BotMessage) => {
//     this.messages.update(msgs => [
//       ...msgs,
//       {
//         sender: 'bot',
//         text: res.message || '',
//         buttons: res.buttons || [],
//       }
//     ]);
//   },
//   error: (err) => {
//     console.error('Error from chatbot API', err);
//     this.messages.update(msgs => [
//       ...msgs,
//       {
//         sender: 'bot',
//         text: 'Sorry, something went wrong!'
//       }
//     ]);
//   }
// });

//   }



  toggleChat() {
    this.isOpen.update(open => !open);
    this.steps.set(1); // Reset steps when toggling chat
    this.initializingForm();
  }

  getStarted() {
    this.steps.update(step => step + 1);
  }

// sendMessage() {
//   const text = this.userInput().trim();
//   if (!text) return;

//   // Push user message to chat
//   this.messages.update(msgs => [...msgs, { sender: 'user', text }]);

//   // Clear input
//   this.userInput.set('');

//   const payload: Message = {
//     user_id: this.userId(),
//     query_text: text,
//     email: this.userEmail()
//   };

//   // Add temporary typing animation message from bot
//   this.messages.update(msgs => [...msgs, { sender: 'bot',text:'', typing: true }]);

//   this.userService.askBot(payload).subscribe({
//     next: (res: BotMessage) => {
//       this.messages.update(msgs => {
//         // Remove the last "typing" message
//         const updated = [...msgs];
//         if (updated.length && updated[updated.length - 1].typing) {
//           updated.pop();
//         }

//         // Add actual bot message
//         updated.push({
//           sender: 'bot',
//           text: res.message || '',
//           buttons: res.buttons || [],
//         });

//         return updated;
//       });
//     },
//     error: (err) => {
//       console.error('Error from chatbot API', err);
//       this.messages.update(msgs => {
//         const updated = [...msgs];
//         if (updated.length && updated[updated.length - 1].typing) {
//           updated.pop();
//         }

//         updated.push({
//           sender: 'bot',
//           text: 'Sorry, something went wrong!'
//         });

//         return updated;
//       });
//     }
//   });
// }


sendMessage() {
  const text = this.userInput().trim();
  if (!text) return;

  this.messages.update(msgs => [...msgs, { sender: 'user', text }]);
  this.userInput.set('');

  const payload: Message = {
    user_id: this.userId(),
    query_text: text,
    email: this.userEmail(),
    language: 'English' // Optional, specify language if needed
  };

  // Typing animation
  this.messages.update(msgs => [...msgs, { sender: 'bot', text: '', typing: true }]);

  this.userService.askBot(payload).subscribe({
    next: (res) => {
      const contentType = res.headers.get('Content-Type');

      // Remove typing message
      this.messages.update(msgs => {
        const updated = [...msgs];
        if (updated.length && updated[updated.length - 1].typing) {
          updated.pop();
        }
        return updated;
      });

      // ✅ JSON response as BotMessage
      if (contentType?.includes('application/json') && res.body) {
        res.body.text().then(jsonString => {
          const botMessage: BotMessage = JSON.parse(jsonString);

          this.messages.update(msgs => [
            ...msgs,
            {
              sender: 'bot',
              text: botMessage.message || '',
              buttons: botMessage.buttons || []
            }
          ]);
        });
      }

      // ✅ CSV download
      else if (contentType?.includes('text/csv') && res.body) {
        const blob = new Blob([res.body], { type: 'text/csv' });
        const disposition = res.headers.get('Content-Disposition');
        
        let filename = 'report.csv'; // default fallback

        if (disposition) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            filename = match[1].trim();
          }
        }


        const blobUrl = URL.createObjectURL(blob);

        this.messages.update(msgs => [
          ...msgs,
          {
            sender: 'bot',
            text: 'CSV file ready for download.',
            fileName: filename,
            fileBlobUrl: blobUrl
          }
        ]);
      }

      // Optional: fallback message if content-type is unknown
      else {
        this.messages.update(msgs => [
          ...msgs,
          {
            sender: 'bot',
            text: 'Received unsupported content type.'
          }
        ]);
      }
    },
    error: (err) => {
      console.error('Error from chatbot API', err);
      this.messages.update(msgs => {
        const updated = [...msgs];
        if (updated.length && updated[updated.length - 1].typing) {
          updated.pop();
        }

        updated.push({
          sender: 'bot',
          text: 'Sorry, something went wrong!'
        });

        return updated;
      });
    }
  });
}

downloadFile(blobUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.click();
}



}
