import { AuthenticationService } from './authentication.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthenticationInfo, User } from './graphql';

@Resolver('Authentication')
export class AuthenticationResolver {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly authService: AuthenticationService) { }

  @Mutation('login')
  async login(
    @Args('name') name: string,
    @Args('password') password: string,
  ): Promise<AuthenticationInfo> {
    return this.authService.login(name, password);
  }

  @Query('users')
  async users(): Promise<User[]> {
    return this.authService.users();
  }
}
