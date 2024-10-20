import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./graphql/authentication.graphql'],
  path: join(process.cwd(), 'src/authentication/graphql.ts'),
  outputAs: 'class',
});
definitionsFactory.generate({
  typePaths: ['./graphql/reservation.graphql'],
  path: join(process.cwd(), 'src/reservation/graphql.ts'),
  outputAs: 'class',
});
