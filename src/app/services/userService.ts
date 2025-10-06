import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment'; // Adjust the path as necessary
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = environment.apiUrl; // Use environment variable or default to localhost
  //private baseUrl = `http://192.168.88.201:5000/`; // Replace with your actual API URL

  constructor(private http:HttpClient) { }

  submitEmail(data:User): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-email`, data);
  }

  getDistricts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-district`);
  }

  getTalukas(data:User): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-taluka`,data);
  }

  getVillagesCities(data:User): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-village-city`, data);
  }

  getMunicipalities(data:User): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-municipal_gp`, data);
  }

  submitUserData(data: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/select-location`, data);
  }

  askBot(data: Message): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.baseUrl}/chat`, data, 
      {
        observe: 'response',
        responseType: 'blob',
      }
    );
  }
}
