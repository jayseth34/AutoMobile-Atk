import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  registeredPhoneNumber: number;
  youllreceive: number;
  youllpay: number;
  totalsale: number;
  totalpurchase: number;
  stockvalue: number;
  cashinhand: number;
  bankamount: number;
  lowstocks: any[];
  youllpayreceiveparty: any[];
  bankaccounts: any[];
  purchasedash: any[];
  currentDate: string;
  daysDiff: number;
  salesData:any;
  selectedPeriod: string;
  constructor(public api: ApiService, public dataService: DataService, private router: Router){}

    ngOnInit(){
      this.registeredPhoneNumber = parseInt(
        JSON.parse(localStorage.getItem('phonenumber') as string)
      );
      
      this.api.getDashboardDetails(this.registeredPhoneNumber).subscribe((response: any) => {
        if (response.status === "Success") {
          this.youllreceive = response.youllreceive
          this.youllpay = response.youllpay
          this.totalsale = response.totalsale
          this.totalpurchase = response.totalpurchase
          this.stockvalue = response.stockvalue 
          this.cashinhand = response.cashinhand   
          this.bankamount = response.bankamount    
          this.lowstocks = response.lowstocks
          this.youllpayreceiveparty = response.youllpayreceiveparty
          this.bankaccounts = response.bankaccounts
          this.purchasedash = response.purchasedash
          console.log(" this.lowstocks",  this.lowstocks)
        } else {
          console.error('Failed ', response.statusmessage);
        }
      });
      this.selectedPeriod = 'This Month';
      this.fetchSalesData(this.selectedPeriod);

      this.currentDate = moment().format('YYYY-MM-DD');
      this.daysDiff = moment(JSON.parse(localStorage.getItem("expiryDate") as string)).diff(this.currentDate, 'days');
      this.dataService.checkPlanExpiry()

      if (this.dataService.isPlanActive && this.daysDiff == 1) {
        Swal.fire({
          title: 'Alert!',
          text: 'Your plan will expire tomorrow',
          confirmButtonText: 'OK',
          showCancelButton: true,
          cancelButtonText: 'Buy Now',
          cancelButtonColor: '#d33',
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            this.router.navigate(['/plans']);
          }
        });
      }
      this.drawGraph();
    }

    fetchSalesData(period: string) {
      const body = {
        registeredPhoneNumber: this.registeredPhoneNumber,
        month: period
      };
  
      this.api.getDashboardSaleDetails(body).subscribe((response: any) => {
        this.salesData = response;
        console.log('response:', response);
        this.drawGraph(); // Redraw the graph with the updated salesData
      });
    }

    drawGraph() {
      const canvas = document.getElementById('salesGraph') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
  
      if (!ctx) return;
  
      const salesByDate = this.processSalesData();
  
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const padding = 50;
      const maxTotal = Math.max(...salesByDate.map(item => item.total));
      const stepX = (canvasWidth - 2 * padding) / (salesByDate.length - 1);
      const scaleY = (canvasHeight - 2 * padding) / maxTotal;
  
      ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas before drawing
  
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, canvasHeight - padding);
      ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
      ctx.stroke();
  
      // Draw the line graph with Bezier curves
      ctx.beginPath();
      ctx.moveTo(padding, canvasHeight - padding - salesByDate[0].total * scaleY);
  
      salesByDate.forEach((data, index) => {
        if (index < salesByDate.length - 1) {
          const x1 = padding + index * stepX;
          const y1 = canvasHeight - padding - data.total * scaleY;
          const x2 = padding + (index + 1) * stepX;
          const y2 = canvasHeight - padding - salesByDate[index + 1].total * scaleY;
  
          const cp1x = x1 + (x2 - x1) / 2;
          ctx.bezierCurveTo(cp1x, y1, cp1x, y2, x2, y2);
        }
      });
  
      ctx.strokeStyle = 'green';
      ctx.stroke();
  
      // Shade the area below the curve
      ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
      ctx.lineTo(padding, canvasHeight - padding);
      ctx.closePath();
  
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.fill();
    }
  
    processSalesData() {
      const groupedData: { [key: string]: number } = {};
  
      this.salesData.saledets.forEach((sale: any) => {
        const date = new Date(sale.invoicedate).toISOString().split('T')[0];
        if (!groupedData[date]) {
          groupedData[date] = 0;
        }
        groupedData[date] += sale.total;
      });
  
      return Object.keys(groupedData).map(date => ({
        date,
        total: groupedData[date]
      }));
    }
  
    onPeriodChange(period: string) {
      this.selectedPeriod = period;
      this.fetchSalesData(period); // Fetch new sales data and redraw graph
    }
}