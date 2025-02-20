import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../interfaces/user';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-modal-form-user',
  templateUrl: './modal-form-user.component.html',
  styleUrl: './modal-form-user.component.scss'
})
export class ModalFormUserComponent {

  today = new Date
  cep = '';
  endereco = {
    rua: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  planosSaude = [
    {
      id: 1,
      descricao: 'Sim'
    },
    {
      id: 2,
      descricao: 'Não'
    },
  ];

  planosOdonto = [
    {
      id: 1,
      descricao: 'Plano Basic'
    },
    {
      id: 2,
      descricao: 'Plano Medium'
    },
    {
      id: 3,
      descricao: 'Plano Plus'
    },
  ];

  estadoCivil = [
    {
      id: 1,
      descricao: 'Solteiro(a)'
    },
    {
      id: 2,
      descricao: 'Casado(a)'
    },
    {
      id: 3,
      descricao: 'Viuvo(a)'
    },
    {
      id: 4,
      descricao: 'Sem declarar'
    },
  ];

  jaFezPilates = [
    {
      id: 1,
      descricao: 'Sim'
    },
    {
      id: 2,
      descricao: 'Não'
    },
  ];

  formUser: FormGroup;
  editUser: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalFormUserComponent>,
    private formBuilder: FormBuilder,
    private userService: UsersService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestore: AngularFirestore,
  ) {}

    ngOnInit() {
      this.buildForm();
      if(this.data && this.data.name) {
        this.editUser = true;
      }
      this.preencherEndereco();
    }
    validateNumberInput(event: KeyboardEvent) {
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }
    preencherEndereco() {
      this.formUser.get('cep')?.valueChanges.subscribe((cep) => {
        cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cep.length === 8) {
          this.userService.buscarCep(cep).subscribe({
            next: (response: any) =>{
              console.log(response)
              if(!response.erro){
                this.formUser.patchValue({
                  rua:response.logradouro,
                  bairro:response.bairro,
                  localidade:response.localidade,
                  estado:response.estado,
                });
              } else{
                alert('Cep não encontrado')
              }
            },
            error: (err) =>{
              console.log(err)
            }
          }
          );
        }
      });
    }

    // SALVAR USUÁRIO
    saveUser() {
      const objUserForm: User = this.formUser.getRawValue();
      if(this.data && this.data.name) {
        // EDITAR USUÁRIOS
        this.userService.update(this.data.firebaseId, objUserForm).then(
          (response: any) => {
            window.alert('Usuário Editado com sucesso');
            this.closeModal();
          })
          .catch(
            err => {
              window.alert('Houve um erro ao salvar o usuário');
              console.error(err);
        });

      } else {
        // SALVAR USUÁRIO
        this.userService.addUser(objUserForm).then(
          (response: any) => {
            window.alert('Usuário Salvo com sucesso');
            this.closeModal();
          })
          .catch(
            err => {
              window.alert('Houve um erro ao salvar o usuário');
              console.error(err);
        });
      }

    }

    buildForm() {
      this.formUser = this.formBuilder.group({
        name: [null, [Validators.required, Validators.minLength(3)]],
        email: ['', [ Validators.email]],
        telefone: [null, [Validators.required, Validators.minLength(2)]],
        cep:[''],
        rua: [''],
        bairro: [''],
        numero:[''],
        complemento:[''],
        localidade: [''],
        estado: [''],
        rg:[''],
        orgao_Emissor:[''],
        profissao:[''],
        naturalidade:[''],
        nacionalidade:[''],
        estado_civil:[''],
        op1:[''],
        op2:[''],
        op3:[''],
        dataMatricula:[this.formatDate(this.today)],
        healthPlan: [''],
        dentalPlan: [''],
      });

      if(this.data && this.data.name) {
        this.fillForm();
      }
    }

    formatDate(date:any) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é baseado em zero
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
  }


  

    // Preencher formulário para edição
    fillForm() {
      this.formUser.patchValue({
        name: this.data.name,
        email: this.data.email,
        telefone: this.data.telefone,
        cep:this.data.cep,
        rua: this.data.rua,
        bairro: this.data.bairro,
        complemento: this.data.complemento,
        numero:this.data.numero,
        cidade: this.data.cidade,
        estado: this.data.estado,
        rg:this.data.rg,
        orgao_Emissor:this.data.orgao_Emissor,
        estado_civil:this.data.estado_civil,
        profissao:this.data.profissao,
        naturalidade:this.data.naturalidade,
        nacionalidade:this.data.nacionalidade,
        op1:this.data.op1,
        op2:this.data.op2,
        op3:this.data.op3,
        dataMatricula: this.data.dataMatricula,
        healthPlan: this.data.healthPlan,
        dentalPlan: this.data.dentalPlan,
      });

    }

    DateToday() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      
      return `${day}/${month}/${year}`;
  }

  rematricula(){
    //newDate
    const newDate = this.formatDate(new Date()); // Obtém a nova data formatada
    this.formUser.patchValue({ dataMatricula: newDate  }); // Atualiza o campo no formulário
    if (this.formUser.valid) {
      this.firestore.collection('users').doc(this.data.firebaseId).update(this.formUser.value) // Salva no Firestore
        .then(() =>{
          window.alert('Aluno Rematriculado');
          this.closeModal();
        })
        .catch(error => console.error("Erro ao salvar:", error));
    } else {
      console.error("Formulário inválido!");
    }
  
  }

    closeModal() { this.dialogRef.close(); }

}
