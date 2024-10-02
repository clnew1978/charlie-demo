import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Apollo, gql } from 'apollo-angular';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';
import { merge, Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { User } from '../objects/authentication';

export interface DialogData {
  userName: string;
  password: string;
}

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.css'
})
export class LoginDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<LoginDialogComponent>);
  @ViewChild('inputPassword') inputPassword: ElementRef | undefined;
  userNameControl = new FormControl<string | User>('');
  private matSnackBar = inject(MatSnackBar);
  users: User[] = [];
  loading = true;
  filteredUsers$: Observable<User[]>;
  received = new Subject<void>();

  constructor(
    private readonly apollo: Apollo,
  ) {
    this.filteredUsers$ = merge(
      this.userNameControl.valueChanges.pipe(startWith('')),
      this.received
    ).pipe(
      map(_ => {
        const value = this.userNameControl.value;
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.users.slice();
      }),
    );
  }

  ngOnInit(): void {
    this.apollo.use('ssoGraphQL').watchQuery({
      query: gql`
      query {
        users{
            id
            name
            phone
            userType
            password
        }
    }`}).valueChanges.subscribe((result: any) => {
        this.users = result.data?.users;
        this.loading = result.loading;
        if (result.error) {
          this.matSnackBar.open(`fetch users information failed`, 'close', { horizontalPosition: 'center', verticalPosition: 'top' });
        }
        this.received.next();
      });
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.users.filter(user => user.name.toLowerCase().includes(filterValue));
  }

  onSelect(user: User) {
    if (this.inputPassword) {
      this.inputPassword.nativeElement.value = user.password;
    }
  }

  getData() {
    return {
      "userName": typeof this.userNameControl.value === 'string' ? this.userNameControl.value : this.userNameControl.value?.name,
      "password": this.inputPassword?.nativeElement.value,
    }
  }

  displayName(user: User): string {
    return user && user.name ? user.name : '';
  }

}
