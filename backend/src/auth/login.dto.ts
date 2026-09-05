import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(3, 64)
  readonly username!: string;

  @IsString()
  @Length(8, 128)
  readonly password!: string;
}
