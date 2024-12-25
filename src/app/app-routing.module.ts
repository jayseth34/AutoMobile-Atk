import { NgModule } from "@angular/core";
import { RouterModule, Routes, RouterLink } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { BusinessInformationComponent } from "./components/business-information/business-information.component";
import { AddPartyComponent } from "./components/add-party/add-party.component";
import { AddItemComponent } from "./components/add-item/add-item.component";
import { DetailsComponent } from "./components/details/details.component";
import { PartyHomepageComponent } from "./components/party-homepage/party-homepage.component";
import { ItemHomepageComponent } from "./components/item-homepage/item-homepage.component";
import { EditDetailComponent } from "./components/edit-detail/edit-detail.component";
import { AddPartyGroupComponent } from "./components/add-party-group/add-party-group.component";
import { PaymentInoutComponent } from "./components/payment-inout/payment-inout.component";
import { LinkPaymentComponent } from "./components/link-payment/link-payment.component";
import { AutoCompleteComponent } from "./components/auto-complete/auto-complete.component";
import { PlansComponent } from "./components/plans/plans.component";
import { RegisterComponent } from "./components/register/register.component";
import { BanksComponent } from "./components/banks/banks.component";
import { BankHomepageComponent } from "./components/bank-homepage/bank-homepage.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { LaunchingSoonComponent } from "./components/launching-soon/launching-soon.component";
import { ImportitemsComponent } from "./components/importitems/importitems.component";
import { GrowbusinessComponent } from "./components/growbusiness/growbusiness.component";
import { SyncshareComponent } from "./components/syncshare/syncshare.component";
import { ApplyloanComponent } from "./components/applyloan/applyloan.component";
import { ReportsComponent } from "./components/reports/reports.component";

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "login", component: LoginComponent },
  { path: "sidebar", component: SidebarComponent },
  { path: "businessinfo", component: BusinessInformationComponent },
  { path: "addparty", component: AddPartyComponent },
  { path: "additem", component: AddItemComponent },
  { path: "addPartyGroup", component: AddPartyGroupComponent },
  { path: "banks", component: BanksComponent },
  { path: "banks-homepage", component: BankHomepageComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "inout", component: LinkPaymentComponent },
  { path: "otherproducts", component: LaunchingSoonComponent },
  { path: "growyourbusiness", component: GrowbusinessComponent },
  { path: "syncshare", component: SyncshareComponent },
  { path: "applyloan", component: ApplyloanComponent },
  { path: "reports", component: ReportsComponent },
  { path: 'import-items', component: ImportitemsComponent },
  { path: "party-homepage", component: PartyHomepageComponent },
  { path: "item-homepage", component: ItemHomepageComponent },
  { path: "pin", component: PaymentInoutComponent },
  { path: "Payment-Link", component: LinkPaymentComponent },
  { path: "plans", component: PlansComponent },
  { path: "Register", component: RegisterComponent },
  { path: "linked", component: LinkPaymentComponent },

  { path: "Sale", pathMatch: "full", redirectTo: "/Sale-Invoice" },
  { path: "Purchase", pathMatch: "full", redirectTo: "/Purchase-Bills" },
  // All other paths above this line.
  { path: ":type", component: DetailsComponent },
  { path: ":type/:fnType", component: EditDetailComponent },
  { path: ":type/:fnType/:invoiceNo", component: EditDetailComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
