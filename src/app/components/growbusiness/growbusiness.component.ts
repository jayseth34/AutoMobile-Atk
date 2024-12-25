import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-growbusiness',
  templateUrl: './growbusiness.component.html',
  styleUrls: ['./growbusiness.component.css']
})
export class GrowbusinessComponent {
constructor(public cs:CommonService){

  }
}
