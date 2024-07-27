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
    customLimit: "",
    creditLimit: "",
    additionalFieldName1:"",
    additionalFieldName2: "",
    additionalFieldName3: "",
    additionalFieldName4: "",
    additionalFieldName1Value: "",
    additionalFieldName2Value: "",
    additionalFieldName3Value: "",
    additionalFieldName4Value: "",
  }

  partyList: { 
    partyname: string, 
    partybalance: number }[] = [];

  partyDetailsResponse: any;

  transactionDetailsResponse: any;

  partyGroupListResponse: any;

  partyByGroupResponse: any;

  itemListResponse: any;

  categoryListResponse: any;

  getItemDetailsData: any;

  getItemByCategoryData: any;

  GetItemTransactionsResponse: any;

  GetItemByCategoryResponse: any;

  partyHomePageSelectedTab: any ='party';

  itemHomePageSelectedTab: any ='item';

  isPartyUpdate:boolean = false;
  isGroupUpdate:boolean = false;
  isItemUpdate:boolean = false;
  isCategoryUpdate:boolean = false;
  oldPartyName:any;
  oldPartyGroupName: any;
  oldCategoryName: any;
  oldItemName:any;
  received: number;
  topayparty: number;
  toreceivefromparty:number;
  typeofpay:any;
  invoicenumber:number;
  paymentType: any;
  // totalNoOfParties: any;

  // totalAmountOfParties: any;

  constructor() { }


}
