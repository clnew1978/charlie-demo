import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Apollo, gql } from 'apollo-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';

import { authenticationChanged$, cleanAuthenticationInfo, setAuthenticationInfo, UserType } from './objects/authentication';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';


const GET_RESERVATIONS = gql`
query reservations($begin: Date, $end: Date, $status: ReservationStatus) {
  reservations(begin: $begin, end: $end, status: $status){
    id
    guestName
    guestPhone
    arrivalTime
    tableSize
    status
  }
}`;

const LOGIN_MUTATION = gql`
mutation login($name: String!, $password: String!){
  login(name: $name, password: $password) {
    token
    name
    userType
  }
}`;

const ADD_RESERVATIONS = gql`
mutation addReservation($guestName: String!,$guestPhone: String!,$arrivalTime: Date!,$tableSize: Int!) {
  addReservation(input:{guestName:$guestName,guestPhone:$guestPhone,arrivalTime:$arrivalTime,tableSize:$tableSize}){
    id
    guestName
    guestPhone
    arrivalTime
    tableSize
    status
  }
}`;

const UPDATE_RESERVATIONS = gql`
mutation updateReservation($id: String!,$guestName:String!,$guestPhone:String!,$arrivalTime:Date!,$tableSize:Int!,$status:ReservationStatus!) {
  updateReservation(input:{id:$id,guestName:$guestName,guestPhone:$guestPhone,arrivalTime:$arrivalTime,tableSize:$tableSize,status:$status}){
    id
    guestName
    guestPhone
    arrivalTime
    tableSize
    status
  }
}`;

interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  arrivalTime: Date;
  tableSize: number;
  status: string;
};


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    CommonModule,
    MatGridListModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    MatSlideToggleModule,
    MatInputModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'charlie-demo';
  readonly dialog = inject(MatDialog);
  private matSnackBar = inject(MatSnackBar);
  dataSource: Reservation[] = [];
  editingReservationID = '';
  displayedColumns: string[] = ['guestName', 'guestPhone', 'arrivalTime', 'tableSize', 'status', 'edit'];
  authenticationChanged$ = authenticationChanged$.asObservable();
  statusFilter = 'All'
  loading = false;
  enableBegin = false;
  enableEnd = false;
  beginTime = new Date();
  endTime = new Date();
  adding = false;
  addingGuestName = '';
  addingGuestPhone = '';
  addingTableSize = 1;
  addingArrivalTime = new Date();


  constructor(private readonly apollo: Apollo) {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    this.beginTime = new Date(t);
    t.setDate(t.getDate() + 7);
    this.endTime = new Date(t);

    authenticationChanged$.subscribe((result) => {
      if (result.token === '') {
        this.dataSource = [];
        this.editingReservationID = '';
        this.adding = false;
        this.enableBegin = false;
        this.enableEnd = false;
        this.loading = false;
        this.addingGuestName = '';
        this.addingGuestPhone = '';
        this.addingArrivalTime = new Date();
        this.addingTableSize = 1;
        this.statusFilter = 'All';
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        this.beginTime = new Date(t);
        t.setDate(t.getDate() + 7);
        this.endTime = new Date(t);
      } else {
        this.updateDateSource();
      }
    });
  }

  login() {
    const dialogRef = this.dialog.open(LoginDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.apollo.use('ssoGraphQL').mutate({
        mutation: LOGIN_MUTATION, variables: { name: result.userName, password: result.password },
      }).subscribe((result: any) => {
        this.loading = result.loading;
        if (result.error || !result.data || !result.data.login) {
          this.matSnackBar.open("Login failed!", "click", { horizontalPosition: 'center', verticalPosition: 'top' });
        } else {
          setAuthenticationInfo(result.data.login);
          console.log('login success');
        }
      });
    });
  }

  logout() {
    cleanAuthenticationInfo();
  }

  updateDateSource() {
    const variables: any = {};
    if (this.enableBegin) {
      variables['begin'] = this.beginTime.getTime();
    }
    if (this.enableEnd) {
      variables['end'] = this.endTime.getTime();
    }
    if (this.statusFilter !== 'All') {
      variables['status'] = this.statusFilter;
    }

    this.apollo.watchQuery({ query: GET_RESERVATIONS, variables }).valueChanges.subscribe((result: any) => {
      this.dataSource = result.data?.reservations;
      this.dataSource.forEach((r) => {
        r.arrivalTime = new Date(r.arrivalTime);
      });
      this.loading = result.loading;
      if (result.error) {
        this.matSnackBar.open(`fetch reservations failed`, 'close', { horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  add() {
    this.adding = true;
  }

  edit(r: Reservation) {
    this.editingReservationID = r.id;
  }

  ok(r: Reservation) {
    const variables = {
      id: r.id,
      guestName: r.guestName,
      guestPhone: r.guestPhone,
      arrivalTime: r.arrivalTime.getTime(),
      tableSize: r.tableSize,
      status: r.status,
    };
    this.apollo.mutate({ mutation: UPDATE_RESERVATIONS, variables }).subscribe((result: any) => {
      this.loading = result.loading;
      if (result.error) {
        this.matSnackBar.open("updateReservation failed!", "click", { horizontalPosition: 'center', verticalPosition: 'top' });
      }
      this.updateDateSource();
    });
    this.editingReservationID = '';
  }

  cancel(r: Reservation) {
    this.editingReservationID = '';
    this.updateDateSource();
  }

  delete(r: Reservation) {
    const variables = {
      id: r.id,
      guestName: r.guestName,
      guestPhone: r.guestPhone,
      arrivalTime: r.arrivalTime.getTime(),
      tableSize: r.tableSize,
      status: 'Canceled',
    };
    this.apollo.mutate({ mutation: UPDATE_RESERVATIONS, variables }).subscribe((result: any) => {
      this.loading = result.loading;
      if (result.error) {
        this.matSnackBar.open("deleteReservation failed!", "click", { horizontalPosition: 'center', verticalPosition: 'top' });
      }
      this.updateDateSource();
    });
    this.editingReservationID = '';
  }

  addOK() {
    if (!this.adding) {
      return;
    }
    const info = authenticationChanged$.getValue();
    const variables: any = {
      guestPhone: this.addingGuestPhone,
      arrivalTime: this.addingArrivalTime.getTime(),
      tableSize: this.addingTableSize,
    };
    if (info.userType === UserType.Employee) {
      variables['guestName'] = this.addingGuestName;
    } else {
      variables['guestName'] = info.name;
    }
    this.addingGuestName = "";
    this.addingGuestPhone = "";
    this.addingTableSize = 1;
    this.addingArrivalTime = new Date();
    this.adding = false;
    console.log(variables);
    this.apollo.mutate({ mutation: ADD_RESERVATIONS, variables }).subscribe((result: any) => {
      this.loading = result.loading;
      if (result.error || !result.data || !result.data.addReservation) {
        this.matSnackBar.open("addReservation failed!", "click", { horizontalPosition: 'center', verticalPosition: 'top' });
      } else {
        this.dataSource = [...this.dataSource, result.data.addReservation as Reservation];
      }
    });
  }

  addCancel() {
    this.addingGuestName = "";
    this.addingGuestPhone = "";
    this.addingTableSize = 1;
    this.addingArrivalTime = new Date();
    this.adding = false;
  }
}
