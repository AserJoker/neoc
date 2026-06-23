import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionBinary } from './ExpressionBinary.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class ExpressionCondition extends Expression {
  private _condition: Expression;
  private _consequent: Expression;
  private _alternate: Expression;
  private constructor(
    condition: Expression,
    consequent: Expression,
    alternate: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_CONDITION, begin, end, stream);
    this._condition = condition;
    this._alternate = alternate;
    this._consequent = consequent;
  }
  public getCondtion(): Expression {
    return this._condition;
  }
  public getConsequent(): Expression {
    return this._consequent;
  }
  public getAlternate(): Expression {
    return this._alternate;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      condition: this._condition.serialize(),
      consequent: this._consequent.serialize(),
      alternate: this._alternate.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const offset = stream.getOffset();
    const condition = ExpressionBinary.read(stream);
    if (!condition) {
      return undefined;
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== '?') {
      stream.setOffset(offset);
      return ExpressionBinary.read(stream);
    }
    stream.eat();
    this.skipSpace(stream);
    const consequent = ExpressionCondition.read(stream);
    if (!condition) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== ':') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    const alternate = ExpressionCondition.read(stream);
    if (!alternate) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionCondition(
      condition,
      consequent as Expression,
      alternate,
      begin,
      end,
      stream.getSource(),
    );
  }
}
