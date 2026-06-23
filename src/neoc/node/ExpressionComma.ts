import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class ExpressionComma extends Expression {
  private _left: Expression;
  private _right: Expression;
  private constructor(
    left: Expression,
    right: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_COMMA, begin, end, stream);
    this._left = left;
    this._right = right;
  }
  public getLeft(): Expression {
    return this._left;
  }
  public getRight(): Expression {
    return this._right;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      left: this._left.serialize(),
      right: this._right.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = ExpressionCondition.read(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    if (stream.read().getText() !== ',') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = ExpressionComma.read(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionComma(left, right, begin, end, stream.getSource());
  }
}
