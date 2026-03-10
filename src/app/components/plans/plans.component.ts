import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';
declare var Razorpay: any;

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {
  registeredphonenumber:number;
  hidesilverplan: boolean = true;
  hidegoldplan: boolean = true;
  hidefreeplan: boolean = true;
  show:boolean = false;
  planType: any;
  activePlan: any;
  isMobileView = window.innerWidth <= 991.98;
  constructor(private api: ApiService, public cs: CommonService, public dataService: DataService) {}

  ngOnInit(): void {
    this.planType = JSON.parse(localStorage.getItem("planType") as string);
    this.activePlan = JSON.parse(localStorage.getItem("planType") as string);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobileView = window.innerWidth <= 991.98;
  }

  get showSilverMobileHint(): boolean {
    return this.isMobileView && (this.activePlan ?? '').toString().toLowerCase() === 'silver';
  }

  buyPlan(plan: string) {
    this.registeredphonenumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") as string));
    let amount = 0;
    this.planType = plan;
  
    if (plan === 'silver') {
      amount = 3399;
    } else if (plan === 'gold') {
      amount = 3999;
    } else if (plan === 'free') {
        var ptype = JSON.parse(localStorage.getItem("planType") as string)
        if (this.cs.isUndefineOrNull(ptype)){
          this.api.createOrder(0, 'INR', this.planType, this.registeredphonenumber).subscribe((response: any) => {
            if(response.status == "SUCCESS"){
              localStorage.setItem("planType", JSON.stringify(this.planType))
              localStorage.setItem("expiryDate", JSON.stringify(response.expiryDate));
              this.activePlan = JSON.parse(localStorage.getItem("planType") as string);
              Swal.fire({text:"Free Trial Activated"}).then(() => {
                location.reload(); 
              })
            }
          });
          return;
        } else {
          Swal.fire({text:"Plan Already active"}).then(() => {
            return
          })
        }
        return;
    }
    this.api.createOrder(amount, 'INR', this.planType,  this.registeredphonenumber).subscribe((response: any) => {
      const options = {
        key: 'rzp_test_c7nXNEo1IBbKnM', 
        amount: response.amount,
        currency: 'INR',
        name: 'AUTOTEKK',
        description: 'Test Transaction',
        order_id: response.id,
        handler: (response:any) => {
          this.api.UpdateExpiryDate(this.planType, this.registeredphonenumber).subscribe((res:any) => {
            if(res.status == "SUCCESS"){
              localStorage.setItem("planType", JSON.stringify(this.planType))
              localStorage.setItem("expiryDate", JSON.stringify(res.expiryDate));
              this.activePlan = JSON.parse(localStorage.getItem("planType") as string);
              alert(`Payment successful. Payment ID: ${response.razorpay_payment_id}`);
              location.reload(); 
              // this.dataService.checkPlanExpiry()
            }
          })
        },
        prefills: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#000000',
        }
      };
  
      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
  
}
