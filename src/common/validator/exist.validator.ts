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
@ValidatorConstraint({ name: 'Exist', async: true })
export class ExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly prismaService: PrismaService) {}

  async validate(
    value: number,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    if (validationArguments.constraints.length <= 0) return false;

    const { model, column }: { model: string; column: string } =
      validationArguments.constraints[0];

    const data = await this.prismaService[`${model}`].findFirst({
      select: {
        id: true,
      },
      where: {
        [column]: value,
      },
    });

    if (data) return true;
    return false;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} not found`;
  }
}

type ExistOnDatabaseOptions = {
  model: string;
  column: string;
};

export function Exist(
  existOnDatabaseOptions: ExistOnDatabaseOptions,
  ValidationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: ValidationOptions,
      constraints: [existOnDatabaseOptions],
      validator: ExistValidator,
    });
  };
}
