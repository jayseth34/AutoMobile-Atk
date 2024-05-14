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
    MatNativeDateModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
