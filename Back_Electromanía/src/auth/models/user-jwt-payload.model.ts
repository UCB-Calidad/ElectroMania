import { UserRole } from 'src/user/enums/UserRole.enum';
export class UserJwtPayloadModel {
  readonly uuid: string;
  readonly email: string;
  readonly role: UserRole;
  constructor(uuid: string, email: string, role: UserRole) {
    this.uuid = uuid;
    this.email = email;
    this.role = role;
  }
  toObject() {
    return {
      uuid: this.uuid,
      email: this.email,
      role: this.role,
    };
  }
}
