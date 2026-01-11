import { UserEntity } from '../../user/entities/user.entity';

export interface AuthResponse {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}

