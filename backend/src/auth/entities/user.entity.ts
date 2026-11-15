import { Prisma, Role } from '@prisma/client';

type UserWithProfiles = Prisma.UserGetPayload<{
  include: { doctorProfile: true; pharmacyProfile: true; patientProfile: true };
}>;

export class UserEntity {
  id: string;
  email: string;
  role: Role;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  doctorProfile: UserWithProfiles['doctorProfile'];
  pharmacyProfile: UserWithProfiles['pharmacyProfile'];
  patientProfile: UserWithProfiles['patientProfile'];

  constructor(user: UserWithProfiles) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role;
    this.verified = user.verified;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.doctorProfile = user.doctorProfile;
    this.pharmacyProfile = user.pharmacyProfile;
    this.patientProfile = user.patientProfile;
  }
}
