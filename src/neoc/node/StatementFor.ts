import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Statement } from './Statement.js';
import { StatementDeclaration } from './StatementDeclaration.js';
import { StatementEmpty } from './StatementEmpty.js';
import { StatementExpression } from './StatementExpression.js';
import { readStatement } from './StatementHelper.js';

export class StatementFor extends Statement {
  private _initialize:
    | StatementDeclaration
    | StatementEmpty
    | StatementExpression;
  private _condtion: StatementExpression;
  private _after: Expression | undefined;
  private _body: Statement;
  private constructor(
    initialize: StatementDeclaration | StatementEmpty | StatementExpression,
    condition: StatementExpression,
    after: Expression | undefined,
    body: Statement,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_FOR, begin, end, stream);
    this._initialize = initialize;
    this._condtion = condition;
    this._after = after;
    this._body = body;
  }
  public getInitialize():
    | StatementDeclaration
    | StatementEmpty
    | StatementExpression {
    return this._initialize;
  }
  public getCondtion(): StatementExpression {
    return this._condtion;
  }
  public getAfter(): Expression | undefined {
    return this._after;
  }
  public getBody(): Statement {
    return this._body;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      initialize: this._initialize.serialize(),
      condtion: this._condtion.serialize(),
      after: this._after?.serialize?.(),
      body: this._body.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementFor | undefined {
    if (stream.read().getText() !== 'for') {
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
    let initialize:
      | StatementDeclaration
      | StatementEmpty
      | StatementExpression
      | undefined = StatementDeclaration.read(stream);
    if (!initialize) {
      initialize = StatementEmpty.read(stream);
    }
    if (!initialize) {
      initialize = StatementExpression.read(stream);
    }
    if (!initialize) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    const condition = StatementExpression.read(stream);
    if (!condition) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    let after: Expression | undefined = undefined;
    if (stream.read().getText() !== ')') {
      after = ExpressionComma.read(stream);
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
    return new StatementFor(
      initialize,
      condition,
      after,
      body,
      begin,
      end,
      stream.getSource(),
    );
  }
}
