import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BusinessInformationComponent } from './components/business-information/business-information.component';
import { AddPartyComponent } from './components/add-party/add-party.component';
import { AddItemComponent } from './components/add-item/add-item.component';

const routes: Routes = [
  {path:'', component:LoginComponent},
  {path:'login', component:LoginComponent},
  {path:'sidebar', component:SidebarComponent},
  {path:'businessinfo', component:BusinessInformationComponent},
  {path:'addparty', component:AddPartyComponent},
  {path:'additem', component:AddItemComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
