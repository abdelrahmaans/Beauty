import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, CartDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'منصة بيوتي | العناية بالشعر والبشرة';
  private router = inject(Router);
  isAdminRoute = signal<boolean>(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url || '';
      // Ensure /centers, /centers/:id, and /centers/my-codes (customer directory) do NOT match /center (partner portal)
      const isCenterPortal = url === '/center' || url.startsWith('/center/') || url.startsWith('/center?');
      const isPortal = url.startsWith('/admin') || url.startsWith('/provider') || isCenterPortal;
      this.isAdminRoute.set(isPortal);
    });
  }
}
