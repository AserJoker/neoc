import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';
import { Statement } from './Statement.js';
import { readStatement } from './StatementHelper.js';

export class StatementWhile extends Statement {
  private _condtion: Expression;
  private _body: Statement;
  private constructor(
    condition: Expression,
    body: Statement,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_WHILE, begin, end, stream);
    this._condtion = condition;
    this._body = body;
  }
  public getCondtion(): Expression {
    return this._condtion;
  }
  public getBody(): Statement {
    return this._body;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      condtion: this._condtion.serialize(),
      body: this._body.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementWhile | undefined {
    const begin = stream.read();
    if (stream.read().getText() !== 'while') {
      return undefined;
    }
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
    this.skipSpace(stream);
    const body = readStatement(stream);
    if (!body) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new StatementWhile(condition, body, begin, end, stream.getSource());
  }
}
