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

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'businessinfo', component: BusinessInformationComponent },
  { path: 'addparty', component: AddPartyComponent },
  { path: 'additem', component: AddItemComponent },
  { path: 'addPartyGroup', component: AddPartyGroupComponent },
  { path: 'sale', pathMatch: 'full', redirectTo: '/sale/sale-invoice' },
  { path: 'sale/sale-invoice', component: DetailsComponent },
  { path: 'purchase', pathMatch: 'full', redirectTo: '/purchase/puchase-bills' },
  { path: 'purchase/puchase-bills', component: DetailsComponent },
  // {path: 'sale', pathMatch: 'full', children: [
  //   {path: '', redirectTo: 'sale-invoice', pathMatch: 'full'},
  //   {path: 'sale-invoice', component: DetailsComponent},
  // ]},
  { path: 'party-homepage', component: PartyHomepageComponent },
  { path: 'item-homepage', component: ItemHomepageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
