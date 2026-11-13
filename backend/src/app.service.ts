import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return { name: 'RxConnect API', status: 'ok' };
  }
}
