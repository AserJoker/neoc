import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Statement } from './Statement.js';
import { readStatement } from './StatementHelper.js';

export class StatementIf extends Statement {
  private _condition: Expression;
  private _consequent: Statement;
  private _alternate: Statement | undefined;
  private constructor(
    condition: Expression,
    consequent: Statement,
    alternate: Statement | undefined,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_IF, begin, end, stream);
    this._condition = condition;
    this._alternate = alternate;
    this._consequent = consequent;
    this._condition.setParent(this);
    this._alternate?.setParent(this);
    this._consequent.setParent(this);
  }
  public getCondtion(): Expression {
    return this._condition;
  }
  public getConsequent(): Statement {
    return this._consequent;
  }
  public getAlternate(): Statement | undefined {
    return this._alternate;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      condition: this._condition.serialize(),
      consequent: this._consequent.serialize(),
      alternate: this._alternate?.serialize?.(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementIf | undefined {
    if (stream.read().getText() !== 'if') {
      return undefined;
    }
    const begin = stream.read();
    stream.eat();
    this.skipSpace(stream);
    if (stream.read().getText() !== '(') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    const condition = ExpressionComma.read(stream);
    if (!condition) {
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
    const consequent = readStatement(stream);
    if (!consequent) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    let alternate: Statement | undefined = undefined;
    if (stream.read().getText() === 'else') {
      stream.eat();
      this.skipSpace(stream);
      alternate = readStatement(stream);
    } else {
      stream.setOffset(offset);
    }
    const end = stream.read();
    return new StatementIf(
      condition,
      consequent,
      alternate,
      begin,
      end,
      stream.getSource(),
    );
  }
}
