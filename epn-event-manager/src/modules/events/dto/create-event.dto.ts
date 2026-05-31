import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9\-_]*$/, {
    message: 'source solo puede contener letras, números, guiones y guiones bajos',
  })
  source: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9\-_]*$/, {
    message: 'entity solo puede contener letras, números, guiones y guiones bajos',
  })
  entity: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[A-Z_]*$/, {
    message: 'action debe estar en mayúsculas (CREATE, READ, UPDATE, DELETE)',
  })
  action: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  payload?: Record<string, any>;
}
