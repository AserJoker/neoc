import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Statement } from './Statement.js';
import { readStatement } from './StatementHelper.js';

export class StatementDoWhile extends Statement {
  private _condtion: Expression;
  private _body: Statement;
  private constructor(
    condition: Expression,
    body: Statement,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_DO_WHILE, begin, end, stream);
    this._condtion = condition;
    this._body = body;
    this._condtion.setParent(this);
    this._body.setParent(this);
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
  ): StatementDoWhile | undefined {
    const begin = stream.read();
    if (stream.read().getText() !== 'do') {
      return undefined;
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
    if (stream.read().getText() !== 'while') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
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
    if (stream.read().getText() !== ';') {
      throw new PositionError(
        `Unexpected or invalid token, missing ';'`,
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new StatementDoWhile(
      condition,
      body,
      begin,
      end,
      stream.getSource(),
    );
  }
}
