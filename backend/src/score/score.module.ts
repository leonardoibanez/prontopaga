import {
  Injectable,
  Module,
  RequestMethod,
  type DynamicModule,
  type MiddlewareConsumer,
  type NestMiddleware,
  type NestModule,
} from '@nestjs/common';
import { ScoreController } from './score.controller';
import {
  calculateSyntheticScore,
  SCORE_CALCULATOR,
  SCORE_CLOCK,
  ScoreService,
} from './score.service';

@Injectable()
export class NoStoreScoreMiddleware implements NestMiddleware {
  use(
    _request: unknown,
    response: { setHeader(name: string, value: string): void },
    next: () => void,
  ): void {
    response.setHeader('Cache-Control', 'no-store');
    next();
  }
}

@Module({})
export class ScoreModule implements NestModule {
  static register(authModule: DynamicModule): DynamicModule {
    return {
      module: ScoreModule,
      imports: [authModule],
      controllers: [ScoreController],
      providers: [
        ScoreService,
        NoStoreScoreMiddleware,
        { provide: SCORE_CALCULATOR, useValue: calculateSyntheticScore },
        { provide: SCORE_CLOCK, useValue: () => new Date() },
      ],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(NoStoreScoreMiddleware)
      .forRoutes({ path: 'score/:rut', method: RequestMethod.GET });
  }
}
