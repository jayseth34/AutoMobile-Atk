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
import { ExpenseHomepageComponent } from "./components/expense-homepage/expense-homepage.component";
import { SilverMobileRestrictionGuard } from "./guards/silver-mobile-restriction.guard";

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "login", component: LoginComponent },
  { path: "sidebar", component: SidebarComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "businessinfo", component: BusinessInformationComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "addparty", component: AddPartyComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "additem", component: AddItemComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "addPartyGroup", component: AddPartyGroupComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "banks", component: BanksComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "banks-homepage", component: BankHomepageComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "dashboard", component: DashboardComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "inout", component: LinkPaymentComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "otherproducts", component: LaunchingSoonComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "growyourbusiness", component: GrowbusinessComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "syncshare", component: SyncshareComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "applyloan", component: ApplyloanComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "reports", component: ReportsComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: 'import-items', component: ImportitemsComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "party-homepage", component: PartyHomepageComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "item-homepage", component: ItemHomepageComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "expense-homepage", component: ExpenseHomepageComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "pin", component: PaymentInoutComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "Payment-Link", component: LinkPaymentComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: "plans", component: PlansComponent },
  { path: "Register", component: RegisterComponent },
  { path: "register", pathMatch: "full", redirectTo: "/Register" },
  { path: "linked", component: LinkPaymentComponent, canActivate: [SilverMobileRestrictionGuard] },

  { path: "Sale", pathMatch: "full", redirectTo: "/Sale-Invoice" },
  { path: "Purchase", pathMatch: "full", redirectTo: "/Purchase-Bills" },
  // All other paths above this line.
  { path: ":type", component: DetailsComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: ":type/:fnType", component: EditDetailComponent, canActivate: [SilverMobileRestrictionGuard] },
  { path: ":type/:fnType/:invoiceNo", component: EditDetailComponent, canActivate: [SilverMobileRestrictionGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
