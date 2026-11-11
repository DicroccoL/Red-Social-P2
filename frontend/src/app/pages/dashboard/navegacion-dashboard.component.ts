import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navegacion-dashboard',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Administración" class="dashboard-nav">
      <a routerLink="/dashboard/usuarios" routerLinkActive="actual" ariaCurrentWhenActive="page"
        >Usuarios</a
      >
      <a routerLink="/dashboard/estadisticas" routerLinkActive="actual" ariaCurrentWhenActive="page"
        >Estadísticas</a
      >
    </nav>
  `,
  styles: `
    .dashboard-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    a {
      padding: 0.5rem 0.8rem;
      border-radius: 999px;
      color: #fff0f5;
      text-decoration: none;
      font-weight: 700;
    }
    a:hover {
      background: #842a4f;
    }
    .actual {
      background: var(--admin-rosa, var(--pink));
      color: var(--admin-tinta, var(--wine));
    }
    .actual:hover {
      background: #ffc7d8;
    }
  `,
})
export class NavegacionDashboardComponent {}
