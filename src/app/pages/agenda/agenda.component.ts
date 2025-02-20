import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt-br';
import timeGridPlugin from '@fullcalendar/timegrid';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {
  selectedDate: Date | null = null;
  selectedTime: string = '';
  studentName: string = '';
  events: EventInput[] = [];
  editingEventId: string | null = null; // ID do evento que está sendo editado

  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: ptLocale,
    selectable: true,
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this), // Captura o clique em um evento
    events: this.events,
    eventContent: this.customEventContent.bind(this),
    initialDate: new Date(),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    }
  };

  handleDateClick(arg: any) {
    this.selectedDate = new Date(arg.date);
    this.editingEventId = null; // Resetando edição ao selecionar nova data
  }

  handleEventClick(arg: any) {
    // Preenche os campos com os dados do evento clicado
    this.selectedDate = new Date(arg.event.start);
    this.selectedTime = arg.event.extendedProps.hora;
    this.studentName = arg.event.title.split(' às ')[0];
    this.editingEventId = arg.event.id; // Armazena o ID para edição e exclusão
  }

  loadEvents() {
    this.firestore.collection('eventos').snapshotChanges().subscribe((snapshot) => {
      this.events = snapshot.map((doc) => {
        const evento = doc.payload.doc.data() as EventInput;
        return { ...evento, id: doc.payload.doc.id }; // Adiciona o ID do Firestore
      });

      this.calendarOptions = { ...this.calendarOptions, events: [...this.events] };
    });
  }

  addOrEditClass() {
    if (this.selectedDate && this.selectedTime && this.studentName) {
      const formattedDate = this.selectedDate.toISOString().split('T')[0] + 'T' + this.selectedTime;
      const evento = {
        title: `${this.studentName} às ${this.selectedTime}`,
        hora: this.selectedTime,
        date: formattedDate
      };

      if (this.editingEventId) {
        // Atualiza o evento existente
        this.firestore.collection('eventos').doc(this.editingEventId).update(evento)
          .then(() => {
            console.log('Evento atualizado com sucesso!');
            this.loadEvents();
            this.resetForm();
          })
          .catch((error) => {
            console.error('Erro ao atualizar evento: ', error);
          });
      } else {
        // Adiciona um novo evento
        this.firestore.collection('eventos').add(evento)
          .then(() => {
            console.log('Evento salvo com sucesso!');
            this.loadEvents();
            this.resetForm();
          })
          .catch((error) => {
            console.error('Erro ao salvar evento: ', error);
          });
      }
    } else {
      alert('Por favor, selecione uma data, horário e insira o nome do aluno.');
    }
  }

  deleteClass() {
    if (this.editingEventId) {
      const confirmDelete = confirm("Tem certeza que deseja excluir este evento?");
      if (confirmDelete) {
        this.firestore.collection('eventos').doc(this.editingEventId).delete()
          .then(() => {
            console.log('Evento excluído com sucesso!');
            this.loadEvents();
            this.resetForm();
          })
          .catch((error) => {
            console.error('Erro ao excluir evento: ', error);
          });
      }
    }
  }

  resetForm() {
    this.selectedDate = null;
    this.selectedTime = '';
    this.studentName = '';
    this.editingEventId = null;
  }

  customEventContent(arg: any) {
    return {
      html: `<div style="font-size: 12px;">${arg.event.title}</div>`
    };
  }
}
