import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private _client: SupabaseClient | null = null;
  public isConnected: boolean = false;

  constructor() {
    this.initSupabase();
  }

  private initSupabase(): void {
    try {
      if (
        environment.supabaseUrl &&
        environment.supabaseKey &&
        !environment.supabaseUrl.includes('your-supabase-project')
      ) {
        this._client = createClient(environment.supabaseUrl, environment.supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        this.isConnected = true;
      } else {
        // Safe fallback mode: will log and use internal storage & mock service
        this.isConnected = false;
      }
    } catch (err) {
      console.warn('Supabase initialization warning, continuing in offline/mock mode:', err);
      this.isConnected = false;
    }
  }

  get client(): SupabaseClient | null {
    return this._client;
  }
}
