import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-launching-soon',
  templateUrl: './launching-soon.component.html',
  styleUrls: ['./launching-soon.component.css']
})
export class LaunchingSoonComponent {
  constructor(public cs:CommonService){

  }
}
