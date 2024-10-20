import { Module } from '@nestjs/common';
import { AuthenticationResolver } from './authentication.resolvers';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AuthenticationService, AuthenticationResolver],
})
// eslint-disable-next-line prettier/prettier
export class AuthenticationModule { }
