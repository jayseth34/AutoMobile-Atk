import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  partyName:any;

  addPartyData = {
    partyName: "",
    gst: "",
    phoneNumber: "",
    partyGroup: "",
    gstType: "",
    _state: "",
    emailId: "",
    billingAddress: "",
    shippingAddress: "",
    openingBalance: "",
    toPayOrReceive: "",
    asOfDate: "",
    creditLimit: "",
    additionalFieldName1:"",
    additionalFieldName2: "",
    additionalFieldName3: "",
    additionalFieldName4: ""
  }

  partyList: { 
    partyname: string, 
    partybalance: number }[] = [];

  partyListResponse: any;

  transactionDetailsResponse: any;

  partyGroupListResponse: any;

  partyByGroupResponse: any;

  // totalNoOfParties: any;

  // totalAmountOfParties: any;

  constructor() { }


}
