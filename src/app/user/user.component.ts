import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  role: string | null = '';
  username: string | null = ''; // Ya tienes esta propiedad
  clienteSeleccionado: boolean = false;
  showSideNav: boolean = false;
  intervalId: any;
  mostrarTodosBotones: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.role = sessionStorage.getItem('role') || 'Usuario';
    this.username = sessionStorage.getItem('username') || 'Usuario'; // Cargar el username desde sessionStorage
    this.verificarClienteSeleccionado();

    // Verificar cambios en sessionStorage cada 500ms
    this.intervalId = setInterval(() => {
      this.verificarClienteSeleccionado();
      this.verificarMostrarBotones();
    }, 500);
  }

  showMenu: boolean = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  
  verificarClienteSeleccionado() {
    const nit = sessionStorage.getItem('nitSeleccionado');
    this.clienteSeleccionado = !!nit;
    if (!this.clienteSeleccionado) {
      this.mostrarTodosBotones = false;
      sessionStorage.setItem('mostrarTodosBotones', 'false');
    }
  }

  verificarMostrarBotones() {
    const mostrar = sessionStorage.getItem('mostrarTodosBotones');
    this.mostrarTodosBotones = mostrar === 'true';
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  toggleSideNav() {
    this.showSideNav = !this.showSideNav;
  }

  logout() {
    sessionStorage.clear();
    this.clienteSeleccionado = false;
    this.mostrarTodosBotones = false;
    this.router.navigate(['/login']);
  }
}