import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
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
  isDragging = false;
  isUploading = false;
  uploadError = '';

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

  onFileChange(event: any) {
    const file = event?.target?.files?.[0] as File | undefined;
    if (!file) return;
    this.setFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.setFile(file);
  }

  clearFile(): void {
    this.fileToUpload = null;
    this.uploadedFileName = '';
    this.fileData = [];
    this.uploadError = '';
  }

  async onSubmit(): Promise<void> {
    if (!this.fileToUpload || !this.registeredPhoneNumber || this.isUploading) {
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    this.api.uploadItems(this.fileToUpload, this.registeredPhoneNumber).subscribe({
      next: async (response: any) => {
        const status = (response?.status ?? '').toString().toLowerCase();
        const isSuccess = status === 'success' || status === 'successful' || status === 'succeeded' || status === 'ok' || status === '200';

        await Swal.fire({
          title: isSuccess ? 'Import started' : 'Import failed',
          text: response?.statusmessage || (isSuccess ? 'Your file was uploaded.' : 'Please check the file and try again.'),
          icon: isSuccess ? 'success' : 'error',
          confirmButtonText: 'OK'
        });

        if (isSuccess) {
          this.clearFile();
        }
        this.isUploading = false;
      },
      error: async (error) => {
        console.error('Error uploading file', error);
        this.uploadError = 'Upload failed. Please try again.';
        this.isUploading = false;
        await Swal.fire({
          title: 'Upload failed',
          text: 'An error occurred during file upload. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
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

  private setFile(file: File): void {
    this.uploadError = '';

    const fileName = (file?.name || '').toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    if (!isExcel) {
      this.uploadError = 'Please select an Excel file (.xlsx or .xls).';
      return;
    }

    this.fileToUpload = file;
    this.uploadedFileName = file.name;
    this.parsePreview(file);
  }

  private parsePreview(file: File): void {
    // Preview only: show the first sheet, capped rows for performance.
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames?.[0];
        if (!sheetName) {
          this.fileData = [];
          return;
        }
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false }) as any[];
        this.fileData = Array.isArray(rows) ? rows.slice(0, 21) : [];
      } catch (e) {
        console.error('Failed to parse preview', e);
        this.fileData = [];
      }
    };
    reader.readAsArrayBuffer(file);
  }
  
}
