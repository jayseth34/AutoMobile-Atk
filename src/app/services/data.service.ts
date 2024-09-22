import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  isPlanActive: any;
  isLogin: boolean = false;
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
  isitemupdate:boolean = false;  
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
  invoicedate:any;
  amountdetails: any;
  isview:boolean = false;
  hidebutton:boolean = false;
  // totalNoOfParties: any;

  // totalAmountOfParties: any;

  selectedOption1: any;
  selectedOption2: any;
  conversionRate: any;
  private selectedOption1Subject = new BehaviorSubject<any>(null);
  private selectedOption2Subject = new BehaviorSubject<any>(null);
  private conversionRateSubject = new BehaviorSubject<any>(null);

  selectedOption1$ = this.selectedOption1Subject.asObservable();
  selectedOption2$ = this.selectedOption2Subject.asObservable();
  conversionRate$ = this.conversionRateSubject.asObservable();

  
  constructor() { }
  setSelectedOption1(value: any) {
    this.selectedOption1Subject.next(value);
  }

  setSelectedOption2(value: any) {
    this.selectedOption2Subject.next(value);
  }

  setConversionRate(value: any) {
    this.conversionRateSubject.next(value);
  }

  getColor(param1: any, param2: any): any {
    const difference = param1 - param2;
    if (difference > 0)  {
      return 'green';
    } else if (difference < 0) {
      return 'red';
    } else {
      return '';
    }
  }

  checkPlanExpiry(){
    const expiryDate = moment(JSON.parse(localStorage.getItem("expiryDate") as string)).format('YYYY-MM-DD');
    const currentDate = moment().format('YYYY-MM-DD');
    const differenceInDays = moment(expiryDate).diff(moment(currentDate), 'days');
    if(expiryDate===currentDate || differenceInDays<0){
      this.isPlanActive = false;
    }
    else {
      this.isPlanActive = true
    }
    if(!this.isPlanActive){
      Swal.fire({
        title: 'Alert!',
        text: 'Your plan has expired! Please recharge to continue.',
        confirmButtonText: 'OK',
        allowOutsideClick: true, 
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          window.location.href = 'http://localhost:4200/plans';
        }
      });
    }
  }

}
