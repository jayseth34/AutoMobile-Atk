import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionTypeEnum } from 'src/app/models';

@Component({
  selector: 'app-edit-detail',
  templateUrl: './edit-detail.component.html',
  styleUrls: ['./edit-detail.component.css']
})
export class EditDetailComponent implements OnInit {
  TransactionType = TransactionTypeEnum;
  transactionType: TransactionTypeEnum;

  constructor(private route: Router) { }
  ngOnInit(): void {
    this.transactionType = this.route.url.split('/')[1] == 'Sale' ? 0 : 1;

  }
}
