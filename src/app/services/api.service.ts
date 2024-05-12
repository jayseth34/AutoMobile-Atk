import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private cs: CommonService) { }

  // PARTY TAB

  AddPartyDetails(body: any){
    return this.cs.Post("api/Login/SaveOrUpdateParty",body);
  }

  //https://localhost:7002/api/Login/GetPartyList?registeredphonenumber=9920279905 - WORKING
  getPartyList(registeredphonenumber: number){       //sidebar
    return this.cs.get(
      "api/Login/GetPartyList?registeredphonenumber=" + registeredphonenumber
    );
  }

  //https://localhost:7002/api/Login/GetPartyDetails?registeredphonenumber=9594645455&partyname=SHREYA- WORKING
  getPartyDetails(registeredphonenumber: number, partyname: any){      //mini sidebar
    return this.cs.get(
      "api/Login/GetPartyDetails?registeredphonenumber=" + registeredphonenumber + "&partyname=" + partyname
    );
  }

  //WORKING
  getPartyTransactions(registeredphonenumber: number,partyname: any){
    return this.cs.get(
      "api/Sale/GetPartyTransactions?registeredphonenumber=" + registeredphonenumber+ "&customername=" + partyname
    );    
  }

  // GROUP TAB

  AddGroupDetails(body: any){
    return this.cs.Post("api/Login/AddUpdatePartyGroup",body);
  }

  GetPartyGroup(registeredPhoneNumber: any){       
    return this.cs.get(
      "api/Login/GetPartyGroup?registeredPhoneNumber=" + registeredPhoneNumber
    );
  }

  //https://localhost:7002/api/Login/GetPartyByGroup?registeredPhoneNumber=9594645455&groupname=SK - WORKING
  GetPartyByGroup(registeredPhoneNumber: any, groupname: any){       
    return this.cs.get(
      "api/Login/GetPartyByGroup?registeredPhoneNumber=" + registeredPhoneNumber + "&groupname=" + groupname
    );
  }

  // AddPartyDetails(body: any){
  //   return this.http.post("http://localhost:4200/party-homepage",body);
  // }
}
