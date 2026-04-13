import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { Subscription, distinctUntilChanged, pairwise, startWith, tap } from 'rxjs';
import { ColumnInfo } from 'src/app/models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.css']
})
export class AutoCompleteComponent implements OnInit, OnChanges {
  @Input({
    alias: "dataList",
    required: true
  }) ogItemList: any[];
  @Input({ required: true }) controlName: string;
  @Input() callBackFunName: string;
  @Input() placeholder: string = "";
  @Input() handleChange: (args: any) => void;
  @Input() dataIsObject: boolean = true;
  @Input() label?: string;
  @Input() columns: ColumnInfo[];
  @Input() maxContentWidth: boolean = false;
  @Input() design: boolean = false;
  @Input() value: string = '';
  calledFirst: boolean = false;
  itemList: any[];
  name: string;
  showList: boolean = false;
  form: FormGroup;
  // @Input() clickApiName: string;
  formSubscripton: Subscription;
  currentFocus: number = -1;

  constructor(private rootFormGroup: FormGroupDirective) { }

  public get getFormControl(): FormControl {
    return this.form?.get(this.controlName) as FormControl;
  }

  ngOnInit(): void {
    this.form = this.rootFormGroup.control;
    this.name = "Country";
    this.itemList = this.ogItemList;

    if (this.controlName.length == 0)
      return;

    if (this.getFormControl.value && this.getFormControl.value.length > 0) {
      if (this.handleChange != null || this.handleChange != undefined) {
        this.selectItem(this.getFormControl.value);
      }
    }

    // In "design" mode we render a native <select>. Filtering the list based on the
    // current selected value would hide other options (banks), so don't auto-filter.
    if (this.getFormControl.value && !this.design) {
      // Keep list in sync with external changes, but don't force-open the dropdown.
      this.formSubscripton = this.getFormControl.valueChanges.subscribe((item: any) =>
        this.filterList(item, false),
      );
    }
  }

  // ngOnDestroy(): void {
  //   this.formSubscripton.unsubscribe();
  // }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    if (changes['ogItemList']) {
      this.itemList = this.ogItemList;
      if (this.ogItemList && this.ogItemList.length > 0 && !this.design) {
        if (this.getFormControl?.value)
          this.filterList(this.getFormControl.value, false);
      }

    }
  }

  changeShowList() {
    this.showList = !this.showList;
  }

  handleInputCLick() {
    // For native <select> mode, always show the full list.
    if (this.design) {
      this.itemList = this.ogItemList;
      return;
    }

    this.showList = true;
    this.filterList(this.getFormControl?.value ?? "", true);
  }

  handleUserTyping(value: string) {
    this.filterList(value ?? "", true);
  }

  handleKeyPress(event: KeyboardEvent) {
    // console.log(event.key);
    switch (event.key) {
      case "ArrowDown":
        this.currentFocus++;
        break;
      case "ArrowUp":
        this.currentFocus--;
        break;
      case "Enter":
        if (this.currentFocus > -1) {
          this.selectItem(this.itemList[this.currentFocus]);
          this.closeList();
        }
        event.preventDefault();
        break;
      case "Escape":
        this.closeList();
        break;
      default:
        break;
    }
  }

  closeList() {
    console.log('Closing List');
    this.showList = false;
  }

  selectItem(item: any) {
    let val = this.dataIsObject ? item[this.columns[0].identifier] : item;
    this.getFormControl.setValue(val);
    if (this.dataIsObject && this.handleChange)
      this.handleChange(item[this.columns[0].identifier]);
    console.log(this.currentFocus);
    this.closeList();
  }

  private norm(v: any): string {
    return (v ?? "").toString().trim().toUpperCase();
  }

  filterList(value: string, openList: boolean) {
    const query = this.norm(value);
    if (openList) this.showList = true;
    // if (value.length == 0)
    //   this.currentFocus = -1;
    // else
    //   this.currentFocus = 0;

    if (!query) {
      this.itemList = this.ogItemList;
      return;
    }

    this.itemList = (this.ogItemList ?? []).filter((item: any) => {
      if (!this.dataIsObject) return this.norm(item).includes(query);

      // Search across all visible columns (not just the first).
      return (this.columns ?? []).some((col) =>
        this.norm(item?.[col.identifier]).includes(query),
      );
    });
  }
}
