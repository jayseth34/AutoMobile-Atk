import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-importitems',
  templateUrl: './importitems.component.html',
  styleUrls: ['./importitems.component.css']
})
export class ImportitemsComponent {
  uploadedFileName: string = '';
  fileData: any[] = [];
  fileToUpload: File | null = null;
  registeredPhoneNumber: number = 0;
  uploadForm: FormGroup;

  constructor(public http: HttpClient, public api: ApiService) {
    // Form initialization
    this.registeredPhoneNumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
    this.uploadForm = new FormGroup({
      file: new FormControl('', Validators.required),
      registeredPhoneNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')])
    });
  }

  // Handle file selection
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
      this.onSubmit()
    }
  }

  onSubmit() {
    if (!this.fileToUpload || !this.registeredPhoneNumber) {
      return;
    }
    this.api.uploadItems(this.fileToUpload, this.registeredPhoneNumber)
      .subscribe(
        (response) => {
          console.log('File uploaded successfully', response);
        },
        (error) => {
          console.error('Error uploading file', error);
        }
      );
  }

  // Download Excel template
  downloadTemplate(): void {
    const sampleData = [
      [
        'Item Name*',
        'Item Code*',
        'Category',
        'HSN',
        'Default MRP',
        'Sale Price*',
        'Purchase Price*',
        'Wholesale Price',
        'Minimum Wholesale Quantity',
        'Opening Stock Quantity',
        'Minimum Stock Quantity',
        'Item Location',
      ],
      ['Item 1', 'a101', '', '', 20, 20, 25, 120, 3, 20, 10, 'Store 1'],
      ['Item 2', 'a102', '', '', 30, 30, 35, 110, 4, 30, 5, 'Store 2'],
      ['Item 3', 'a103', '', '', 35, 35, 40, 45, 2, 35, 15, 'Store 1'],
      ['Item 4', 'a104', '', '', 20, 20, 25, 56, 6, 10, 10, 'Store 1'],
      ['Item 5', 'a105', '', '', 30, 30, 35, 78, 8, 5, 5, 'Store 2'],
      ['Item 6', 'a106', '', '', 35, 35, 37, 89, 3, 15, 15, 'Store 1'],
      ['Item 7', 'a107', '', '', 20, 20, 25, '', '', 10, 10, 'Store 1']
    ];
  
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Item Data');
  
    XLSX.writeFile(workbook, 'Item_Data.xlsx');
  }
  
}
