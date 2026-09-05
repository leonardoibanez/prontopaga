import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { AuthenticatedPrincipal } from '../auth/auth.types';
import { formatRut, isValidRut, normalizeRut } from '../rut/rut';

export type ScoreCalculator = (rut: string) => number;
export type ScoreClock = () => Date;

export const SCORE_CALCULATOR = Symbol('SCORE_CALCULATOR');
export const SCORE_CLOCK = Symbol('SCORE_CLOCK');

export interface ScoreConsultation {
  readonly rut: string;
  readonly score: number;
  readonly fecha: string;
}

export function calculateSyntheticScore(rut: string): number {
  const digest = createHash('sha256').update(rut, 'utf8').digest();
  return digest.readUInt32BE(0) % 101;
}

@Injectable()
export class ScoreService {
  constructor(
    @Inject(SCORE_CALCULATOR)
    private readonly calculator: ScoreCalculator,
    @Inject(SCORE_CLOCK)
    private readonly clock: ScoreClock,
  ) {}

  consult(rut: string, principal: AuthenticatedPrincipal): ScoreConsultation {
    if (!isValidRut(rut)) {
      throw new BadRequestException();
    }

    const normalizedRut = normalizeRut(rut);
    const formattedRut = formatRut(rut);
    if (normalizedRut === null || formattedRut === null) {
      throw new BadRequestException();
    }

    if (principal.role === 'user' && principal.rut !== normalizedRut) {
      throw new ForbiddenException();
    }

    return {
      rut: formattedRut,
      score: this.calculator(normalizedRut),
      fecha: this.clock().toISOString(),
    };
  }
}
