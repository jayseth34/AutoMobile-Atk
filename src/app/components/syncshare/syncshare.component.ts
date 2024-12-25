import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-syncshare',
  templateUrl: './syncshare.component.html',
  styleUrls: ['./syncshare.component.css']
})
export class SyncshareComponent {
constructor(public cs:CommonService){

  }
}
