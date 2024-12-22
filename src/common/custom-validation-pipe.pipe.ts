import {
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

@Injectable()
// export class CustomValidationPipePipe implements PipeTransform {
export class CustomValidationPipePipe
  extends ValidationPipe
  implements PipeTransform
{
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const data = errors.map((error) => {
          return {
            field: error.property,
            errors: Object.values(error.constraints),
          };
        });

        throw new UnprocessableEntityException(data);
      },
    });
  }

  // async transform(value: any, { metatype }: ArgumentMetadata) {
  //     if (!metatype || !this.toValidate(metatype)) {
  //         return value;
  //     }
  //     console.log('metatype', metatype)
  //     console.log('value', value)
  //     const object = plainToInstance(metatype, value);
  //     console.log('object', object)
  //     const errors = await validate(object);
  //     console.log('errors', errors)
  //     if (errors.length > 0) {
  //         throw new BadRequestException('Validation failed');
  //     }
  //     return value;
  // }

  // private toValidate(metatype: Function): boolean {
  //     const types: Function[] = [String, Boolean, Number, Array, Object];
  //     console.log('metatype', metatype)
  //     return !types.includes(metatype);
  // }
}
