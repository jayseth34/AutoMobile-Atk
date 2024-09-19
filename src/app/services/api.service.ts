import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from './common.service';
import { GetBankRq, GetBankRs, GetPartyTransactionDetailsRq, GetTypeOfPayTransactionsRq, ItemListRs, LinkedTransaction, LoginReponse, LoginRequest, Party, PartyListRs, PaymentInOut, SaveUpdateTransactionRq, TransactionDetails, TrnxInOut } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private cs: CommonService) { }

  AuthenticateUser(body: LoginRequest) {
    return this.cs.PostType<LoginReponse, any>("Login/AuthenticateUser", body)
  }

  // DASHBOARD
  getDashboardDetails(registeredphonenumber: number) {       
    return this.cs.get(
      "Login/DashboardDetails?registeredphonenumber=" + registeredphonenumber
    );
  }

  getDashboardSaleDetails(body: any) {   
    return this.cs.Post("Login/DashboardSaleDetails", body)    
  }

  // BUSINESS INFO
  getBusinessInfo(registeredphonenumber: number) {       
    return this.cs.get(
      "Login/GetBusinessInfo?registeredphonenumber=" + registeredphonenumber
    );
  }

  addBusinessInfo(body: any){
    return this.cs.Post("Login/AddUpdateBusinessInformation", body)
  }

  // PARTY TAB

  AddPartyDetails(body: any) {
    return this.cs.Post("Login/SaveOrUpdateParty", body);
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
      "Login/GetPartyDetails?registeredphonenumber=" + registeredphonenumber + "&partyname=" + partyname
    );
  }

  //WORKING
  getPartyTransactions(registeredphonenumber: number, partyname: any) {
    return this.cs.get(
      "Sale/GetPartyTransactions?registeredphonenumber=" + registeredphonenumber + "&customername=" + partyname
    );
  }

  // GROUP TAB

  AddGroupDetails(body: any) {
    return this.cs.Post("Login/AddUpdatePartyGroup", body);
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

  getBankList(rq: GetBankRq){
    let endpoint = 'Sale/GetBanks';
    return this.cs.PostType<GetBankRs ,GetBankRq>(endpoint, rq);
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
      "Login/GetPartyGroup?registeredPhoneNumber=" + registeredPhoneNumber
    );
  }

  //https://localhost:7002/api/Login/GetPartyByGroup?registeredPhoneNumber=9594645455&groupname=SK - WORKING
  GetPartyByGroup(registeredPhoneNumber: any, groupname: any) {
    return this.cs.get(
      "Login/GetPartyByGroup?registeredPhoneNumber=" + registeredPhoneNumber + "&groupname=" + groupname
    );
  }

  // AddPartyDetails(body: any){
  //   return this.http.post("http://localhost:4200/party-homepage",body);
  // }


  ///////////////////////// ITEMSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS

  assignCode(body: any) {
    return this.cs.Post("Item/AssignCode", body);
  }

  AddItemDetails(body: any) {
    return this.cs.Post("Item/SaveOrUpdateItem", body);
  }

  GetItemList(registeredPhoneNumber: any) {
    return this.cs.get(
      "Item/GetItemList?registeredPhoneNumber=" + registeredPhoneNumber
    );
  }

  GetItemDetails(registeredPhoneNumber: any, itemname: any) {
    return this.cs.get(
      "Item/GetItemDetails?registeredPhoneNumber=" + registeredPhoneNumber + "&itemname=" + itemname
    );
  }

  GetItemTransactions(registeredPhoneNumber: any, itemname: any) {
    return this.cs.get(
      "Sale/GetItemTransactions?registeredPhoneNumber=" + registeredPhoneNumber + "&itemname=" + itemname
    );
  }

  GetCategory(registeredPhoneNumber: any) {
    return this.cs.get(
      "Item/GetCategory?registeredPhoneNumber=" + registeredPhoneNumber
    );
  }

  GetItemByCategory(registeredPhoneNumber: any, category: any) {
    return this.cs.get(
      "Item/GetItemByCategory?registeredPhoneNumber=" + registeredPhoneNumber + "&category=" + category
    );
  }

  AddUpdateCategory(body: any) {
    return this.cs.Post("Item/AddUpdateCategory", body);
  }


  // Update Sale Details
  PostUpdateSaleDetails(req: SaveUpdateTransactionRq, isEdit: boolean) {
    if (isEdit && !req.issaleconvert && !req.ispurchaseconvert && !req.issaleorderconvert)
      return this.cs.PostType<string, SaveUpdateTransactionRq>("Sale/UpdateSale", req);
    else
      return this.cs.PostType<string, SaveUpdateTransactionRq>("Sale/AddSale", req);
  }

  getTransactions(registeredPhoneNumber: number, customername: string, typeofpay: string): Observable<any> {
    let body = {
      registeredphonenumber: registeredPhoneNumber,
      customername: customername,
      typeofpay: typeofpay
    }
    return this.cs.Post(
      "Sale/GetLinkedPaymentTransaction", body
    );
  }

  updateTransactions(transactions: any): Observable<any> {
    return this.cs.Post("Sale/UpdateLinkedPaymentTransaction", transactions)
  }

  UpdatePaymentInOutTrnx(paymentInOut : PaymentInOut): Observable<any>{
    return this.cs.Post("Sale/UpdatePaymentInOutTrnx", paymentInOut)
  }

  InsertAdvanceTrnx(body:any): Observable<any>{
    return this.cs.Post("Sale/InsertAdvanceTrnx", body)
  }

  getTrnxInOut(trnxInOut : any): Observable<any>{
    return this.cs.Post("Sale/GetPaymentInOutTransactionDetails", trnxInOut)
  }

  createOrder(amount: number, currency: string, planType: string, registeredphonenumber: number) {
    return this.cs.Post("Login/create-order", { amount, currency, planType, registeredphonenumber });
  }

  GetOtp(phonenumber:string){
    return this.cs.get("Login/send-otp?phoneNumber=" + phonenumber)
  }
  
  VerifyOtp(body:any){
    return this.cs.Post("Login/verify-otp", body)
  }

  UpdateExpiryDate(planType:any, registeredphonenumber:number){
    return this.cs.Post("Login/UpdateExpiryDate", { planType, registeredphonenumber })
  }

  registerUser(body: any){
    return this.cs.Post("Login/RegisterUser", body)
  }

  getAccounts(body:any): Observable<any[]> {
    return this.cs.Post("Sale/GetBanks", body);
  }

  GetBanksDetailsValues(data: any): Observable<any> {
    return this.cs.Post("Sale/GetBanksDetailsValues", data);
  }

  getbanksDetails(body:any): Observable<any> {
    return this.cs.Post("Sale/GetBankDetails", body);
  }

  SaveBankDetails(body:any): Observable<any> {
    return this.cs.Post("Sale/SaveBankDetails", body);
  }

  transfers(body:any):Observable<any>{
    return this.cs.Post("Sale/transfers", body);
  }

  GetUpdatedTrnxInOutVal(body:any):Observable<any>{
    return this.cs.Post("Sale/GetUpdatedTrnxInOutVal", body)
  }

  GetTransferDetailsValues(body:any):Observable<any>{
    return this.cs.Post("Sale/GetTransferDetailsValues", body)
  }

}
