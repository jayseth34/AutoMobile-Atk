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

    if (this.getFormControl.value)

      this.formSubscripton = this.getFormControl.valueChanges.subscribe((item: any) => this.filterList(item));
  }

  // ngOnDestroy(): void {
  //   this.formSubscripton.unsubscribe();
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ogItemList']) {
      this.itemList = this.ogItemList;
      if (this.ogItemList && this.ogItemList.length > 0) {
        if (this.getFormControl?.value)
          this.filterList(this.getFormControl.value);
      }

    }
  }

  changeShowList() {
    this.showList = !this.showList;
  }

  handleInputCLick() {
    this.showList = true;
    this.itemList = this.ogItemList;
  }

  handleKeyPress(event: KeyboardEvent) {
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
    this.showList = false;
  }

  selectItem(item: any) {
    let val = this.dataIsObject ? item[this.columns[0].identifier] : item;
    this.getFormControl.setValue(val);
    if (this.dataIsObject && this.handleChange)
      this.handleChange(item[this.columns[0].identifier]);
    this.closeList();
  }

  filterList(value: string) {
    value = value.toUpperCase();
    this.showList = true;
    if (value.length == 0)
      this.currentFocus = -1;
    else
      this.currentFocus = 0;
    this.itemList = this.ogItemList.filter((item: any) => {
      let temp: string;
      if (this.dataIsObject)
        temp = item[this.columns[0].identifier];
      else
        temp = item;

      temp = temp.toUpperCase();
      if (temp.match(`^${value}`))
        return true;
      else
        return false;
    });

    if (!this.calledFirst) {
      this.calledFirst = true;
      this.closeList();
    }
  }
}
