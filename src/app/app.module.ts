import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BusinessInformationComponent } from './components/business-information/business-information.component';
import { AddPartyComponent } from './components/add-party/add-party.component';
import { AddItemComponent } from './components/add-item/add-item.component';
import { DetailsComponent } from './components/details/details.component';
import { PartyHomepageComponent } from './components/party-homepage/party-homepage.component';
import { ItemHomepageComponent } from './components/item-homepage/item-homepage.component';
import { SelectUnitComponent } from './components/select-unit/select-unit.component';
import { EditDetailComponent } from './components/edit-detail/edit-detail.component';
import { AddPartyGroupComponent } from './components/add-party-group/add-party-group.component';
import { AddItemCategoryComponent } from './components/add-item-category/add-item-category.component';
import { PaymentInoutComponent } from './components/payment-inout/payment-inout.component';
import { AutoCompleteComponent } from './components/auto-complete/auto-complete.component';
import { ClickOutsideDirective } from './click-outside.directive';
import { LinkPaymentComponent } from './components/link-payment/link-payment.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { PlansComponent } from './components/plans/plans.component';
import { RegisterComponent } from './components/register/register.component';
import { RemoveHyphenPipe } from './remove-hyphen.pipe';
import { BanksComponent } from './components/banks/banks.component';
import { BankHomepageComponent } from './components/bank-homepage/bank-homepage.component';
import { TransferModalComponent } from './components/transfer-modal/transfer-modal.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SidebarComponent,
    BusinessInformationComponent,
    AddPartyComponent,
    AddItemComponent,
    DetailsComponent,
    PartyHomepageComponent,
    ItemHomepageComponent,
    SelectUnitComponent,
    AddPartyGroupComponent,
    EditDetailComponent,
    AddItemCategoryComponent,
    PaymentInoutComponent,
    LinkPaymentComponent,
    AutoCompleteComponent,
    ClickOutsideDirective,
    PaymentHistoryComponent,
    PlansComponent,
    RegisterComponent,
    RemoveHyphenPipe,
    BanksComponent,
    BankHomepageComponent,
    TransferModalComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    FormsModule,
    HttpClientModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    MatCardModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
