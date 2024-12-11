import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export class GoogleGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    console.log('called google guard');
    // console.log(`활성화함수 결과 : ${await super.canActivate(context)}`);
    const result = await super.canActivate(context);
    // console.log(`result : ${result}`);
    return result as boolean;
  }
}
