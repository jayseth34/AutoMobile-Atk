import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private cs: CommonService) { }

  getAddParty(body: any){
    return this.cs.Post("party-homepage",body);
  }

  // getAddParty(body: any){
  //   return this.http.post("http://localhost:4200/party-homepage",body);
  // }
}
