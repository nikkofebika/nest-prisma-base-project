import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { PrismaService } from '../services/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class UniqueValidator implements ValidatorConstraintInterface {
  constructor(private readonly prismaService: PrismaService) { }

  async validate(
    value: any,
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

    if (data) return false;
    return true;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} already exists`;
  }
}

type UniqueOptions = {
  model: string;
  column: string;
  id?: any;
};

export function Unique(
  uniqueOptions: UniqueOptions,
  ValidationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: ValidationOptions,
      constraints: [uniqueOptions],
      validator: UniqueValidator,
    });
  };
}
