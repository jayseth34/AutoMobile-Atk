import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
declare var Razorpay: any;

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent {
  constructor(private api: ApiService) {}

  buyPlan(plan: string) {
    let amount = 0;
    let planType = plan;
  
    if (plan === 'silver') {
      amount = 3399;
    } else if (plan === 'gold') {
      amount = 3999;
    } else if (plan === 'free') {
      // No payment for free trial
      this.api.createOrder(0, 'INR', planType).subscribe((response: any) => {
        alert('Free trial activated');
        // Handle free trial activation here
      });
      return;
    }
  
    this.api.createOrder(amount, 'INR', planType).subscribe((response: any) => {
      const options = {
        key: 'YOUR_KEY_ID', // Enter the Key ID generated from the Dashboard
        amount: response.amount,
        currency: 'INR',
        name: 'Your Company Name',
        description: 'Test Transaction',
        order_id: response.id,
        handler: (response:any) => {
          alert(`Payment successful. Payment ID: ${response.razorpay_payment_id}`);
          // Handle successful payment here
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#F37254'
        }
      };
  
      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
  
}
