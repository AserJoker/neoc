import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class Spread extends NeocNode {
  expression: Expression;
  private constructor(
    expression: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.SPREAD, begin, end, stream);
    this.expression = expression;
  }
  public getExpression(): Expression {
    return this.expression;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      expression: this.expression.serialize(),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>): Spread | undefined {
    if (stream.read().getText() !== '...') {
      return undefined;
    }
    const begin = stream.read();
    stream.eat();
    this.skipSpace(stream);
    const expression = ExpressionCondition.read(stream);
    if (!expression) {
      throw new PositionError(
        'unexpected statement',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new Spread(expression, begin, end, stream.getSource());
  }
}
