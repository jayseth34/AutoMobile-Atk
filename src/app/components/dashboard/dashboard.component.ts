import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';
import { CommonService } from 'src/app/services/common.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit{
  registeredPhoneNumber: number;
  youllreceive: number;
  youllpay: number;
  totalsale: number;
  totalpurchase: number;
  stockvalue: number;
  cashinhand: number;
  bankamount: number;
  totalexpense: number = 0;
  lowstocks: any[];
  youllpayreceiveparty: any[];
  bankaccounts: any[];
  purchasedash: any[];
  currentDate: string;
  daysDiff: number;
  salesData: any;
  selectedPeriod: string;
  totalSales: number = 0;
  lastMonthTotalSales: number = 0;
  salesDeltaPct: number | null = null;
  salesDeltaLabel: string = '';
  receivablePartiesCount: number = 0;
  payablePartiesCount: number = 0;
  businessName: string = '';
  showAllLowStocks: boolean = false;
  constructor(public api: ApiService, public dataService: DataService, public cs: CommonService, private router: Router){}

  get visibleLowstocks(): any[] {
    if (!Array.isArray(this.lowstocks)) return [];
    return this.showAllLowStocks ? this.lowstocks : this.lowstocks.slice(0, 3);
  }

  toggleLowStocks() {
    this.showAllLowStocks = !this.showAllLowStocks;
  }

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
          this.totalexpense = response.totalexpense
          this.lowstocks = response.lowstocks
          this.youllpayreceiveparty = response.youllpayreceiveparty
          this.bankaccounts = response.bankaccounts
          this.purchasedash = response.purchasedash
          this.recomputePartyCounts();
        } else {
          console.error('Failed ', response.statusmessage);
        }
      });
      this.selectedPeriod = 'This Month';
      this.fetchSalesData(this.selectedPeriod);
      this.fetchLastMonthSalesTotal();

      this.api.getBusinessInfo(this.registeredPhoneNumber).subscribe({
        next: (res: any) => this.businessName = res?.businessInfo?.businessName?.trim() || '',
        error: () => this.businessName = ''
      });

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

    ngAfterViewInit(): void {
      // Ensure canvas has the correct rendered size before first draw.
      setTimeout(() => this.drawGraph());
    }

    fetchSalesData(period: string) {
      const body = {
        registeredPhoneNumber: this.registeredPhoneNumber,
        month: period
      };
  
      this.api.getDashboardSaleDetails(body).subscribe((response: any) => {
        this.salesData = response;
        this.drawGraph(); // Redraw the graph with the updated salesData
      });
    }

    private fetchLastMonthSalesTotal() {
      const body = {
        registeredPhoneNumber: this.registeredPhoneNumber,
        month: 'Last Month'
      };

      this.api.getDashboardSaleDetails(body).subscribe({
        next: (response: any) => {
          const grouped = this.groupSalesByDate(response?.saledets ?? []);
          this.lastMonthTotalSales = Object.values(grouped).reduce((acc, v) => acc + v, 0);
          this.updateSalesDelta();
        },
        error: () => {
          this.lastMonthTotalSales = 0;
          this.updateSalesDelta();
        }
      });
    }

    private recomputePartyCounts() {
      const list = Array.isArray(this.youllpayreceiveparty) ? this.youllpayreceiveparty : [];
      this.receivablePartiesCount = list.filter((x: any) => (x?.partyreceive ?? 0) > 0).length;
      this.payablePartiesCount = list.filter((x: any) => (x?.partypay ?? 0) > 0).length;
    }

    drawGraph() {
      const canvas = document.getElementById('salesGraph') as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
  
      if (!ctx) return;
  
      const salesByDate = this.processSalesData();
      if (salesByDate.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Responsive backing store (retina-safe)
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const cssW = Math.max(320, canvas.clientWidth || 600);
      const cssH = Math.max(220, canvas.clientHeight || 300);
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  
      const canvasWidth = cssW;
      const canvasHeight = cssH;
      const padL = 54;
      const padR = 18;
      const padT = 18;
      const padB = 34;
      const maxTotal = Math.max(...salesByDate.map(item => item.total), 0);
      const innerW = Math.max(1, canvasWidth - padL - padR);
      const innerH = Math.max(1, canvasHeight - padT - padB);
      const stepX = salesByDate.length <= 1 ? innerW : innerW / (salesByDate.length - 1);
      const scaleY = maxTotal <= 0 ? 0 : innerH / maxTotal;
  
      ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas before drawing

      // Background grid
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1;
      const yTicks = 4;
      for (let i = 0; i <= yTicks; i++) {
        const y = padT + (innerH * i) / yTicks;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(canvasWidth - padR, y);
        ctx.stroke();
      }
      ctx.restore();

      // Axis labels
      ctx.save();
      ctx.fillStyle = 'rgba(71, 85, 105, 0.9)';
      ctx.font = '12px Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= yTicks; i++) {
        const val = Math.round((maxTotal * (yTicks - i)) / yTicks);
        const y = padT + (innerH * i) / yTicks;
        ctx.fillText(this.formatCompactAmount(val), padL - 10, y);
      }

      // X labels (sparse)
      const maxLabels = 6;
      const step = Math.max(1, Math.ceil(salesByDate.length / maxLabels));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i < salesByDate.length; i += step) {
        const x = padL + i * stepX;
        const label = this.formatShortDate(salesByDate[i].date);
        ctx.fillText(label, x, canvasHeight - padB + 10);
      }
      ctx.restore();

      // Line + area
      const points = salesByDate.map((d, i) => {
        const x = padL + i * stepX;
        const y = padT + (innerH - d.total * scaleY);
        return { x, y };
      });

      if (points.length === 1) {
        const y = points[0].y;
        ctx.save();
        const grad1 = ctx.createLinearGradient(0, padT, 0, canvasHeight - padB);
        grad1.addColorStop(0, 'rgba(37, 99, 235, 0.26)');
        grad1.addColorStop(1, 'rgba(37, 99, 235, 0.02)');
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(canvasWidth - padR, y);
        ctx.lineTo(canvasWidth - padR, canvasHeight - padB);
        ctx.lineTo(padL, canvasHeight - padB);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(canvasWidth - padR, y);
        ctx.stroke();
        ctx.restore();
        return;
      }

      // Area fill
      ctx.save();
      const grad = ctx.createLinearGradient(0, padT, 0, canvasHeight - padB);
      grad.addColorStop(0, 'rgba(37, 99, 235, 0.26)');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0.02)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const p = points[i];
        const n = points[i + 1];
        const cpX = p.x + (n.x - p.x) / 2;
        ctx.bezierCurveTo(cpX, p.y, cpX, n.y, n.x, n.y);
      }
      ctx.lineTo(points[points.length - 1].x, canvasHeight - padB);
      ctx.lineTo(points[0].x, canvasHeight - padB);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Stroke
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const p = points[i];
        const n = points[i + 1];
        const cpX = p.x + (n.x - p.x) / 2;
        ctx.bezierCurveTo(cpX, p.y, cpX, n.y, n.x, n.y);
      }
      ctx.stroke();
      ctx.restore();
    }
  
    processSalesData() {
      const groupedData = this.groupSalesByDate(this.salesData?.saledets ?? []);
      const dates = Object.keys(groupedData).sort();
      this.totalSales = dates.reduce((acc, d) => acc + groupedData[d], 0);
      this.updateSalesDelta();
      return dates.map(date => ({ date, total: groupedData[date] }));
    }

    private groupSalesByDate(saledets: any[]): { [key: string]: number } {
      const groupedData: { [key: string]: number } = {};
      if (!Array.isArray(saledets)) return groupedData;

      for (const sale of saledets) {
        const dt = new Date(sale?.invoicedate);
        if (Number.isNaN(dt.getTime())) continue;
        const date = dt.toISOString().split('T')[0];
        if (!groupedData[date]) groupedData[date] = 0;
        groupedData[date] += Number(sale?.total ?? 0);
      }
      return groupedData;
    }

    private updateSalesDelta() {
      if (this.selectedPeriod !== 'This Month' || !this.lastMonthTotalSales) {
        this.salesDeltaPct = null;
        this.salesDeltaLabel = '';
        return;
      }

      const delta = this.totalSales - this.lastMonthTotalSales;
      const pct = (delta / this.lastMonthTotalSales) * 100;
      this.salesDeltaPct = pct;
      const abs = Math.abs(pct);
      const dir = pct > 0 ? 'more' : pct < 0 ? 'less' : 'same';
      this.salesDeltaLabel = `${abs.toFixed(0)}% ${dir} than last month`;
    }

    private formatCompactAmount(n: number): string {
      const abs = Math.abs(n);
      if (abs >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
      if (abs >= 100000) return `${(n / 100000).toFixed(1)}L`;
      if (abs >= 1000) return `${(n / 1000).toFixed(0)}k`;
      return `${n}`;
    }

    private formatShortDate(isoDate: string): string {
      // isoDate is expected like YYYY-MM-DD
      const m = moment(isoDate, 'YYYY-MM-DD', true);
      return m.isValid() ? m.format('D MMM') : isoDate;
    }
  
    onPeriodChange(period: string) {
      this.selectedPeriod = period;
      this.fetchSalesData(period); // Fetch new sales data and redraw graph
    }

    goAddSale() {
      this.router.navigateByUrl('/Sale-Invoice/add');
    }

    goAddPurchase() {
      this.router.navigateByUrl('/Purchase-Bills/add');
    }

    goSalesInvoices() {
      this.router.navigateByUrl('/Sale-Invoice');
    }

    goPurchaseBills() {
      this.router.navigateByUrl('/Purchase-Bills');
    }

    goReceivables() {
      this.dataService.partyHomePageSelectedTab = 'party';
      this.router.navigateByUrl('/party-homepage');
    }

    goPayables() {
      this.dataService.partyHomePageSelectedTab = 'party';
      this.router.navigateByUrl('/party-homepage');
    }

    goItems() {
      this.dataService.itemHomePageSelectedTab = 'item';
      this.router.navigateByUrl('/item-homepage');
    }

    goBanks() {
      this.router.navigateByUrl('/banks-homepage');
    }

    goExpenses() {
      this.router.navigateByUrl('/expense-homepage');
    }

    printDashboard() {
      window.print();
    }

    @HostListener('window:resize')
    onResize() {
      // redraw graph to fit the new size
      this.drawGraph();
    }
}
