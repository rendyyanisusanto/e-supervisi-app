export interface LoginPayload {
  username: string;
  password?: string; // Optional for dummy bypass or future OAuth
}

export interface AuthUserDto {
  id: number;
  teacherId?: number;
  name: string;
  username: string;
  email?: string;
  roles: string[];
  position?: string;
  avatar?: string;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  accessToken: string;
  refreshToken?: string;
}
