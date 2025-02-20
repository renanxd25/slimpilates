import { Component } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private usersService: UsersService){}

  userName: string | null;
  listusers: User[] = [];

ngOnInit() {
    this.getAllUsers()
    this.userName = sessionStorage.getItem('user');
  }

getAllUsers(){
  this.usersService.getAllUsers().subscribe({
    next: (response:any) =>{
      this.listusers = response.slice(-3);
    }
  })
}  

}
