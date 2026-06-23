import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class ExpressionGroup extends Expression {
  private _expression: Expression;
  private constructor(
    expression: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_GROUP, begin, end, stream);
    this._expression = expression;
  }
  public getExpression(): Expression {
    return this._expression;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      expression: this._expression.serialize(),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>) {
    const begin = stream.read();
    if (stream.read().getText() !== '(') {
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const expression = ExpressionComma.read(stream);
    if (!expression) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== ')') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    const end = stream.read();
    return new ExpressionGroup(expression, begin, end, stream.getSource());
  }
}
