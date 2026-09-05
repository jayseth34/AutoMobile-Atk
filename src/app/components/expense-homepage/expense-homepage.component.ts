import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';
import { ExpenseListItem, GetExpenseListRs } from 'src/app/models';
import { AddExpenseComponent } from '../add-expense/add-expense.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expense-homepage',
  templateUrl: './expense-homepage.component.html',
  styleUrls: ['./expense-homepage.component.css']
})
export class ExpenseHomepageComponent implements OnInit {

  registeredPhoneNumber: number;
  expenselist: ExpenseListItem[] = [];
  filteredExpenselist: ExpenseListItem[] = [];
  searchTerm: string = '';
  totalExpense: number = 0;
  displayedColumns: string[] = ['expensedate', 'category', 'partyname', 'description', 'paymenttype', 'total', 'options'];

  constructor(public dialog: MatDialog, private api: ApiService, public dataService: DataService) {
    this.registeredPhoneNumber = parseInt(JSON.parse(localStorage.getItem('phonenumber') as string));
  }

  private getDialogConfig(width: string, height?: string, data?: any) {
    const isMobile = window.innerWidth <= 767.98;
    return {
      width: isMobile ? '96vw' : width,
      height: isMobile ? 'auto' : height,
      maxWidth: isMobile ? '96vw' : '95vw',
      maxHeight: isMobile ? '92vh' : '95vh',
      panelClass: isMobile ? 'mobile-app-dialog' : '',
      data
    };
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.api.getExpenseList(this.registeredPhoneNumber).subscribe((response: GetExpenseListRs) => {
      if (response.status === 'SUCCESS') {
        this.expenselist = response.expenselist || [];
        this.filteredExpenselist = this.expenselist;
        this.totalExpense = this.expenselist.reduce((sum, e) => sum + Number(e.total || 0), 0);
      }
    });
  }

  onSearch(): void {
    const term = (this.searchTerm || '').toLowerCase();
    this.filteredExpenselist = this.expenselist.filter((e) =>
      (e.category || '').toLowerCase().includes(term) ||
      (e.partyname || '').toLowerCase().includes(term) ||
      (e.description || '').toLowerCase().includes(term)
    );
  }

  openAddExpenseModal(expense?: ExpenseListItem): void {
    const data = expense ? { ...expense, isexpenseupdate: true } : { isexpenseupdate: false };
    const dialogRef = this.dialog.open(AddExpenseComponent, this.getDialogConfig('720px', '600px', data));
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.loadExpenses();
      }
    });
  }

  async deleteExpense(expense: ExpenseListItem): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete expense?',
      text: `This will remove the ${expense.category} expense of ${expense.total}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    this.api.deleteExpense({ expense_id: expense.expense_id, registeredphonenumber: this.registeredPhoneNumber }).subscribe((response: any) => {
      if (response.status === 'SUCCESS') {
        this.loadExpenses();
      } else {
        Swal.fire({ text: response.statusmessage || 'Something went wrong' });
      }
    });
  }
}
