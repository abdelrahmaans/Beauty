import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models';
import { AuthService } from './auth.service';
import { MOCK_NOTIFICATIONS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private _notifications = signal<AppNotification[]>([]);

  readonly notifications = this._notifications.asReadonly();

  readonly unreadCount = computed(() => {
    return this._notifications().filter(n => !n.is_read).length;
  });

  constructor(private auth: AuthService) {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const saved = localStorage.getItem('beauty_notifications');
    if (saved) {
      try {
        this._notifications.set(JSON.parse(saved));
      } catch {
        this._notifications.set(MOCK_NOTIFICATIONS);
      }
    } else {
      this._notifications.set(MOCK_NOTIFICATIONS);
    }
  }

  private saveNotifications(): void {
    localStorage.setItem('beauty_notifications', JSON.stringify(this._notifications()));
  }

  addNotification(title: string, body: string, userId: string, relatedBookingId?: string): void {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      user_id: userId,
      title,
      body,
      is_read: false,
      related_booking_id: relatedBookingId,
      created_at: new Date().toISOString()
    };

    this._notifications.update(list => [newNotif, ...list]);
    this.saveNotifications();
  }

  markAsRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    this.saveNotifications();
  }

  markAllAsRead(): void {
    this._notifications.update(list =>
      list.map(n => ({ ...n, is_read: true }))
    );
    this.saveNotifications();
  }
}
