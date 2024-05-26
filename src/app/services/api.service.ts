import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from './common.service';
import { GetPartyTransactionDetailsRq, GetTypeOfPayTransactionsRq, ItemListRs, LoginReponse, LoginRequest, Party, PartyListRs, TransactionDetails } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private cs: CommonService) { }

  AuthenticateUser(body: LoginRequest) {
    return this.cs.PostType<LoginReponse, any>("Login/AuthenticateUser", body)
  }

  // PARTY TAB

  AddPartyDetails(body: any) {
    return this.cs.Post("api/Login/SaveOrUpdateParty", body);
  }

  //https://localhost:7002/api/Login/GetPartyList?registeredphonenumber=9920279905 - WORKING
  getPartyList(registeredphonenumber: number) {       //sidebar
    return this.cs.get(
      "Login/GetPartyList?registeredphonenumber=" + registeredphonenumber
    );
  }

  //https://localhost:7002/api/Login/GetPartyDetails?registeredphonenumber=9594645455&partyname=SHREYA- WORKING
  getPartyDetails(registeredphonenumber: number, partyname: any) {      //mini sidebar
    return this.cs.get(
      "api/Login/GetPartyDetails?registeredphonenumber=" + registeredphonenumber + "&partyname=" + partyname
    );
  }

  //WORKING
  getPartyTransactions(registeredphonenumber: number, partyname: any) {
    return this.cs.get(
      "api/Sale/GetPartyTransactions?registeredphonenumber=" + registeredphonenumber + "&customername=" + partyname
    );
  }

  // GROUP TAB

  AddGroupDetails(body: any) {
    return this.cs.Post("api/Login/AddUpdatePartyGroup", body);
  }

  getTypeOfTransactions(transactionType: string, phonenumber: number) {
    let requestParams = new HttpParams();
    let req = {
      "registeredphonenumber": phonenumber,
      "typeofpay": transactionType.toUpperCase()
    }
    requestParams = requestParams.appendAll(req);
    return this.cs.typeGet<GetTypeOfPayTransactionsRq>("Sale/GetTypeOfPayTransactions", requestParams);
  }

  getPartyListTyped(phonenumber: number) {
    let params = new HttpParams();
    params.append("registeredphonenumber", phonenumber)
    let endpoint = 'Login/GetPartyList';
    return this.cs.typeGet<PartyListRs>(endpoint, params);
  }

  getItemList(phonenumber: number) {
    let endpoint = `Item/GetItemList?registeredphonenumber=${phonenumber}`;
    return this.cs.typeGet<ItemListRs>(endpoint);
  }

  getTransactionDetails(phNo: number, invNo: number, type: string, isSaleConvert: boolean, isSaleOrder: boolean) {
    const body: GetPartyTransactionDetailsRq = {
      "registeredphonenumber": phNo,
      "invoicenumber": invNo,
      "typeofpay": type.toUpperCase(),
      "issaleconvert": isSaleConvert,
      "issaleorderconvert": isSaleOrder
    };
    const endPoint = "Sale/GetPartyItemTransactionDetails";
    return this.cs.PostType<TransactionDetails, GetPartyTransactionDetailsRq>(endPoint, body);
  }

  GetPartyGroup(registeredPhoneNumber: any) {
    return this.cs.get(
      "api/Login/GetPartyGroup?registeredPhoneNumber=" + registeredPhoneNumber
    );
  }

  //https://localhost:7002/api/Login/GetPartyByGroup?registeredPhoneNumber=9594645455&groupname=SK - WORKING
  GetPartyByGroup(registeredPhoneNumber: any, groupname: any) {
    return this.cs.get(
      "api/Login/GetPartyByGroup?registeredPhoneNumber=" + registeredPhoneNumber + "&groupname=" + groupname
    );
  }

  // AddPartyDetails(body: any){
  //   return this.http.post("http://localhost:4200/party-homepage",body);
  // }
}
