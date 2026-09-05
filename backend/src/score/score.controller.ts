import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedPrincipal } from '../auth/auth.types';
import { ScoreService } from './score.service';

@Controller('score')
@UseGuards(AuthGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get(':rut')
  getScore(
    @Param('rut') rut: string,
    @Req() request: { readonly user: AuthenticatedPrincipal },
  ) {
    return this.scoreService.consult(rut, request.user);
  }
}
