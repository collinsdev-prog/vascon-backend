import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from './config.service';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService) => {
    const redisUrl = configService.get('REDIS_PUBLIC_URL');
    return new Redis(redisUrl);
  },
  inject: [ConfigService],
};
