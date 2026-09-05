import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { LoginResponse } from './auth.types';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto): LoginResponse {
    return this.authService.login(body.username, body.password);
  }
}
