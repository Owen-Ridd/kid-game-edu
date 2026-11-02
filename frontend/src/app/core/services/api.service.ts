import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { LoginRequest, LoginResponse } from '../models/auth.models';
import { Game, GameplaySession, Session } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl: string;

  constructor(private readonly http: HttpClient) {
    this.apiUrl = this.detectApiUrl();
  }

  private detectApiUrl(): string {
    // 1. Check custom saved backend URL in localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kid-game-edu-api-url');
      if (saved) {
        return saved.replace(/\/$/, '') + (saved.endsWith('/api') ? '' : '/api');
      }

      // 2. Global window override (if injected via window.__API_URL__)
      const winApi = (window as unknown as { __API_URL__?: string }).__API_URL__;
      if (winApi) {
        return winApi.replace(/\/$/, '') + (winApi.endsWith('/api') ? '' : '/api');
      }

      // 3. If running locally on localhost/127.0.0.1
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8080/api';
      }
    }

    // 4. Default production backend on Render (or relative /api)
    return 'https://kid-game-edu-backend.onrender.com/api';
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  setApiUrl(url: string): void {
    const cleanUrl = url.replace(/\/$/, '') + (url.endsWith('/api') ? '' : '/api');
    this.apiUrl = cleanUrl;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kid-game-edu-api-url', cleanUrl);
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request);
  }

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/admin/games`);
  }

  getGameById(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/admin/games/${id}`);
  }

  createGame(game: Game): Observable<Game> {
    return this.http.post<Game>(`${this.apiUrl}/admin/games`, game);
  }

  updateGame(id: string, game: Game): Observable<Game> {
    return this.http.put<Game>(`${this.apiUrl}/admin/games/${id}`, game);
  }

  publishGame(id: string): Observable<Game> {
    return this.http.post<Game>(`${this.apiUrl}/admin/games/${id}/publish`, {});
  }

  deleteGame(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/games/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; publicId: string }>(`${this.apiUrl}/admin/storage/upload`, formData);
  }

  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/admin/sessions`);
  }

  createSession(gameId: string, groupName: string): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/admin/sessions`, { gameId, groupName });
  }

  deactivateSession(id: string): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/admin/sessions/${id}/deactivate`, {});
  }

  validatePin(pinCode: string): Observable<GameplaySession> {
    return this.http.post<GameplaySession>(`${this.apiUrl}/gameplay/sessions/validate`, { pinCode });
  }

  getGameForPin(pinCode: string): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/gameplay/sessions/${pinCode}`);
  }

  recordMistake(pinCode: string): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/gameplay/sessions/${pinCode}/mistakes`, {});
  }
}