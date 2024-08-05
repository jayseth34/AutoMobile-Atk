import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BusinessInformationComponent } from './components/business-information/business-information.component';
import { AddPartyComponent } from './components/add-party/add-party.component';
import { AddItemComponent } from './components/add-item/add-item.component';
import { DetailsComponent } from './components/details/details.component';
import { PartyHomepageComponent } from './components/party-homepage/party-homepage.component';
import { ItemHomepageComponent } from './components/item-homepage/item-homepage.component';
import { EditDetailComponent } from './components/edit-detail/edit-detail.component';
import { AddPartyGroupComponent } from './components/add-party-group/add-party-group.component';
import { PaymentInoutComponent } from './components/payment-inout/payment-inout.component';
import { LinkPaymentComponent } from './components/link-payment/link-payment.component';
import { AutoCompleteComponent } from './components/auto-complete/auto-complete.component';
import { PlansComponent } from './components/plans/plans.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'businessinfo', component: BusinessInformationComponent },
  { path: 'addparty', component: AddPartyComponent },
  { path: 'additem', component: AddItemComponent },
  { path: 'addPartyGroup', component: AddPartyGroupComponent },
  { path: 'Sale', pathMatch: 'full', redirectTo: '/Sale/sale-invoice' },
  { path: 'Sale/sale-invoice', component: DetailsComponent },
  { path: 'Sale/estimate-quotation', component: DetailsComponent },
  { path: 'Sale/payment-in', component: DetailsComponent },
  { path: 'Sale/sale-order', component: DetailsComponent },
  { path: 'Sale/delivery-challan', component: DetailsComponent },
  { path: 'Sale/sale-return', component: DetailsComponent },

  { path: 'Purchase', pathMatch: 'full', redirectTo: '/Purchase/purchase-bills' },
  { path: 'Purchase/purchase-bills', component: DetailsComponent },
  { path: 'Purchase/payment-out', component: DetailsComponent },
  { path: 'Purchase/purchase-order', component: DetailsComponent },
  { path: 'Purchase/purchase-return', component: DetailsComponent },

  { path: ':type/edit/:invoiceNo', component: EditDetailComponent },
  { path: ':type/add', component: EditDetailComponent },
  { path: 'party-homepage', component: PartyHomepageComponent },
  { path: 'item-homepage', component: ItemHomepageComponent },
  { path: 'inout', component: PaymentInoutComponent },
  { path: 'linked', component: LinkPaymentComponent },
  { path: 'plans', component: PlansComponent },
  { path: 'register', component: RegisterComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
