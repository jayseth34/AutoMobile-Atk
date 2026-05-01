import { HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { GetPartyTransactionDetailsRq } from '../models';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  baseURL = environment.backendUrl + "/api/";
  authToken: any;
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      // authorization: "",
      // "cache-control": "no-cache",
    }),
  };
  constructor(public http: HttpClient) { }

  errorHandler(error: HttpErrorResponse) {
    Swal.fire(error.message, "", "error");
    return throwError(() => error.error);
  }

  UpdateHttpRequest() {
    this.authToken = JSON.parse(localStorage.getItem("AuthToken") || '{}');
    this.httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json; charset=utf-8",
        authorization: "Bearer " + this.authToken.token,
        // "cache-control": "no-cache",
      }),
    };
  }

  Post(endPoint: any, body: any): Observable<any> {
    this.authToken = JSON.parse(localStorage.getItem("AuthToken") || '{}');
    let headers = new HttpHeaders();
    headers = headers.append("Authorization", "Bearer " + this.authToken.token);
    headers = headers.append("Content-Type", "application/json");
    return this.http
      .post(this.baseURL + endPoint, body, { headers: headers })
      .pipe(catchError(this.errorHandler));
  }

  get(endPoint: any): Observable<any> {
    this.UpdateHttpRequest();
    return this.http
      .get(this.baseURL + endPoint, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  typeGet<T>(endPoint: any, requestParams?: HttpParams): Observable<T> {
    let newHttpOptions;
    this.UpdateHttpRequest();
    if (requestParams) {
      newHttpOptions = { ...this.httpOptions, params: requestParams }
    }
    return this.http
      .get<T>(this.baseURL + endPoint, requestParams ? newHttpOptions : this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  PostType<T, P>(endPoint: string, body: P): Observable<T> {
    this.authToken = JSON.parse(localStorage.getItem("AuthToken") || '{}');
    let headers = new HttpHeaders();
    headers = headers.append("Authorization", "Bearer " + this.authToken.token);
    headers = headers.append("Content-Type", "application/json");
    return this.http
      .post<T>(this.baseURL + endPoint, body, { headers: headers })
      .pipe(catchError(this.errorHandler));
  }

  isUndefineOrNull(value: any) {
    if (value == null || value == '' || value == "") {
      return true;
    } else {
      return false;
    }
  }

  public formatDate(date: any): string {
    if (date == '') {
      return date;
    }
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  launch(){
    Swal.fire({text:"Launching Soon!"})
  }
}
