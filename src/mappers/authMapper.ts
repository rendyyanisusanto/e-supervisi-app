import type { AuthUserDto, AuthResponseDto } from '../types/dto/auth.dto';

export class AuthMapper {
  static toAuthUserDto(apiUser: any): AuthUserDto {
    return {
      id: Number(apiUser.id),
      teacherId: Number(apiUser.teacher_id),
      name: apiUser.name,
      username: apiUser.username,
      email: apiUser.email,
      roles: apiUser.roles || [],
      position: apiUser.position,
      avatar: apiUser.photo, // backend uses photo, frontend uses avatar
    };
  }

  static toAuthResponseDto(apiResponse: any): AuthResponseDto {
    return {
      user: this.toAuthUserDto(apiResponse.user),
      accessToken: apiResponse.access_token,
      refreshToken: apiResponse.refresh_token,
    };
  }
}
