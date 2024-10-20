import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date')
export class DateScalar implements CustomScalar<number, number> {
  description = 'Date custom scalar type';

  parseValue(value: number): number {
    return value;
  }

  serialize(value: number): number {
    return value;
  }

  parseLiteral(ast: ValueNode): number {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value);
    }
    return null;
  }
}
