import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './user/home/home.component';
import { RegisterComponent } from './user/register/register.component';



export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Ruta por defecto
  { path: 'login', component: LoginComponent }, 
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '/login' }, // Ruta comodín para redirigir a login si no existe la ruta

];