import { Component, ViewChild } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { User } from '../../interfaces/user';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ModalViewUserComponent } from './modal-view-user/modal-view-user.component';
import { ModalFormUserComponent } from './modal-form-user/modal-form-user.component';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.scss'
})
export class CrudComponent {

  displayedColumns: string[] = ['name', 'email', 'telefone', 'benefits', 'data', 'action'];
  dataSource: any;
  listusers: User[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private usersService: UsersService,
    public dialog: MatDialog,
    ) {
    this.dataSource = new MatTableDataSource<any>(this.listusers);
  }

  ngOnInit() {
    this.getListUsers();
    console.log(this.getListUsers())
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // FUNÇÕES DOS USUÁRIOS
  getListUsers() {
    this.usersService.getAllUsers().subscribe({
      next: (response: any) => {
        this.convertTimestampToDate(response.dataMatricula)
        console.log(response)
        this.listusers = response;

        this.dataSource = new MatTableDataSource<any>(this.listusers);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.paginator._intl.itemsPerPageLabel="Itens por página";
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  convertTimestampToDate(timestamp: any) {
    // Converter segundos para milissegundos
    const milliseconds = timestamp?.seconds * 1000 + Math.floor(timestamp?.nanoseconds / 1e6);
    
    // Criar um objeto Date
    const date = new Date(milliseconds);
    
    // Obter dia, mês e ano
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Mês começa do zero
    const year = date.getUTCFullYear();
    
    // Retornar no formato dd/mm/yyyy
    return `${day}/${month}/${year}`;
}

  deleteUser(firebaseId: string) {
    this.usersService.deleteUser(firebaseId).then(
      (response: any) => {
        window.alert('Usuário excluído com sucesso');
      }
    );
  }
  // FIM FUNÇÕES DOS USUÁRIOS

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

    isStudentDateValid(registrationDate:any) {
    const currentDate:any = new Date();
    
    // Divide a string no formato "dd/mm/aaaa"
    const [day, month, year] = registrationDate.split('/').map(Number);
    const registeredDate:any = new Date(year, month - 1, day);
    
    // Calcula a diferença em milissegundos e converte para dias
    const diffInTime = currentDate - registeredDate;
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    
    return diffInDays <= 30;
}

  // LOGICA DO MODAL
  openModalViewUser(user: User) {
    this.dialog.open(ModalViewUserComponent, {
      width: '800px',
      height: '430px',
      data: user
    })
  }

  openModalAddUser() {
    this.dialog.open(ModalFormUserComponent, {
      width: '800px',
      height: '510px'
    }).afterClosed().subscribe(() => this.getListUsers() );
  }

  openModalEditUser(user: User) {
    this.dialog.open(ModalFormUserComponent, {
      width: '800px',
      height: '510px',
      data: user
    }).afterClosed().subscribe(() => this.getListUsers() );
  }

  openWhatsApp(telefone: string): void {
    if (telefone) {
        // Remove caracteres especiais do número
        let numeroFormatado = telefone.replace(/\D/g, '');
        
        // Abre o WhatsApp com o número formatado
        window.open(`https://wa.me/${numeroFormatado}`, '_blank');
    }
}

}
