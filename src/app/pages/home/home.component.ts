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
  listUsersAll: User[] = [];
  today = new Date();
  lastUsers: any;
  lastPorCent: any;
  percente: any

ngOnInit() {
    this.getAllUsers()
    this.userName = sessionStorage.getItem('user');
    console.log(this.listUsersAll)
    
  }

getAllUsers(){
  this.usersService.getAllUsers().subscribe({
    next: (response:any) =>{
      console.log(response, ' response')
      console.log(this.listusers, ' listusers')
      this.listusers = response.slice(-3);

        const usersRecentes = this.listusers.filter((user:any) => {
        const dataMatricula = this.parseDate(user.dataMatricula);
        const diffTime = this.today.getTime() - dataMatricula.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24); // Converter milissegundos para dias
        return diffDays <= 30 && diffDays >= 0;});
        this.listUsersAll = usersRecentes 
        this.lastUsers = `${usersRecentes.slice(-5).length}/5`
        this.lastPorCent = usersRecentes.slice(-5).length
        console.log('teste ', this.lastPorCent)
    }
  })
}

parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); // Mês começa do 0 em JavaScript
};


calcularPorcentagem(valor:any) {
  const total = 5;
  const porcentagem = (valor / total) * 100;
  this.percente = porcentagem
  return `${porcentagem.toFixed(0)}%`;
}




}
