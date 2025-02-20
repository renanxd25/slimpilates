import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiCep = 'https://viacep.com.br/ws';

  constructor(
    private dataBaseStore: AngularFirestore, 
    private http: HttpClient) {}
  
  buscarCep(cep: string): Observable<any> {
    return this.http.get<any>(`${this.apiCep}/${cep}/json/`);
  }

  getAllUsers() {
    return this.dataBaseStore.collection('users', user => user.orderBy('name')).valueChanges({idField: 'firebaseId'}) as Observable<any[]>;
  }

  addUser(user: User) {
    return this.dataBaseStore.collection('users').add(user);
  }

  update(userId: string, user: User) {
    return this.dataBaseStore.collection('users').doc(userId).update(user);
  }

  deleteUser(userId: string) {
    return this.dataBaseStore.collection('users').doc(userId).delete();
  }

}
