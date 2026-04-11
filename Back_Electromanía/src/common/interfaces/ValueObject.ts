import { ApiProperty } from '@nestjs/swagger';

type Primitives = string | number | boolean | Date;

export abstract class ValueObject<T extends Primitives> {
  @ApiProperty({
    name: 'value',
    description: 'Objeto de valor',
    readOnly: true,
  })
  readonly value: T;
  public constructor(value: T) {
    this.value = value;
  }
  private isDefined(value: T) {
    if (value === null || value === undefined) {
      throw new Error('Value most be defined');
    }
  }
}
