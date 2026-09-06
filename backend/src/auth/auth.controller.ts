import { Body, Controller, Header, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import type { LoginResponse } from './auth.types';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { LoginRateLimitGuard } from './login-rate-limit.guard';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @UseGuards(LoginRateLimitGuard)
  login(@Body() body: LoginDto): LoginResponse {
    return this.authService.login(body.username, body.password);
  }
}
