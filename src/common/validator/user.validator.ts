import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

/** interfaces */
import { PrismaService } from '../services/prisma/prisma.service';

@ValidatorConstraint({ name: 'EmailExist', async: true })
@Injectable()
export class EmailExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly prismaService: PrismaService) {
    console.log('PrismaService injected:', !!this.prismaService);
  }

  async validate(value: string): Promise<boolean> {
    try {
      const isEmailExist = await this.prismaService.user.findFirst();
      if (isEmailExist) return false;
      return true;
    } catch (e) {
      console.log('e', e);
      return false;
    }
  }

  defaultMessage(): string {
    return 'Email already exists';
  }
}

export const IsUserExist = (validationOptions?: ValidationOptions) => {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: EmailExistValidator,
    });
  };
};
