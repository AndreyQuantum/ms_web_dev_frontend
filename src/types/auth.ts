export interface AdminUser {
  login: string;
  role: 'admin';
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}
