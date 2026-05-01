import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { saleData } from './dummyData';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private backendUrl: string = environment.backendUrl;
  private saleData = saleData;

  constructor() { }

  async callBackend(endPoint: string, data: string, method: string) {
    if (this.backendUrl) {
      const response = await fetch(this.backendUrl + endPoint, {
        method: method,
        body: data,
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      });

      if (response.status != 200) {
        console.error("APi Call failed");
      }
      const res = await response.json();
      return res;
    } else {
      // From Dummy Data
      return saleData;
    }
  }
}
