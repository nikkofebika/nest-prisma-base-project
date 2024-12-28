import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { PrismaService } from '../services/prisma/prisma.service';

@Injectable()
@ValidatorConstraint({ name: 'Match', async: true })
export class MatchValidator implements ValidatorConstraintInterface {
  constructor(private readonly prismaService: PrismaService) { }

  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): boolean {
    const [relatedPropertyName] = validationArguments.constraints;
    return value === validationArguments.object[relatedPropertyName];
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} must match with ${validationArguments.constraints[0]} field`;
  }
}

export function Match(
  column: string,
  ValidationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: ValidationOptions,
      constraints: [column],
      validator: MatchValidator,
    });
  };
}
