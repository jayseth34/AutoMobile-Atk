import { HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  authToken: any;
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      // authorization: "",
      // "cache-control": "no-cache",
    }),
  };
  constructor(public http: HttpClient) { }

  errorHandler(error: HttpErrorResponse){
    return throwError(error);
  }

  UpdateHttpRequest() {
    // this.authToken = JSON.parse(localStorage.getItem("AuthToken") || '{}');
    this.httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json; charset=utf-8",
        // authorization: "Bearer " + this.authToken.token,
        // "cache-control": "no-cache",
      }),
    };
  }

  Post(endPoint: any, body: any): Observable<any> {
    // this.authToken = JSON.parse(localStorage.getItem("AuthToken") || '{}');
    let headers = new HttpHeaders();
    // headers = headers.append("Authorization", "Bearer" + this.authToken.token);
    headers = headers.append("Content-Type", "application/json");
    return this.http
    .post("https://localhost:7002/" + endPoint, body, {headers: headers })
    .pipe(catchError(this.errorHandler));
  }

  get(endPoint: any): Observable<any> {
    this.UpdateHttpRequest();
    return this.http
      .get("https://localhost:7002/" + endPoint, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
}
