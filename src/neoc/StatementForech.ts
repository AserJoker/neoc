import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';
import { Statement } from './Statement.js';
import { readStatement } from './StatementHelper.js';

export class StatementForeach extends Statement {
  private _mutable: boolean;
  private _idntifier: LiteralIdentifier;
  private _kind: 'of' | 'in';
  private _expression: Expression;
  private _body: Statement;
  private constructor(
    mutable: boolean,
    identifier: LiteralIdentifier,
    kind: 'of' | 'in',
    expression: Expression,
    body: Statement,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_FOREACH, begin, end, stream);
    this._mutable = mutable;
    this._idntifier = identifier;
    this._kind = kind;
    this._expression = expression;
    this._body = body;
  }
  public isMutable(): boolean {
    return this._mutable;
  }
  public getIdentifier(): LiteralIdentifier {
    return this._idntifier;
  }
  public getKind(): 'of' | 'in' {
    return this._kind;
  }
  public getExpression(): Expression {
    return this._expression;
  }
  public getBody(): Statement {
    return this._body;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      mutable: this._mutable,
      identifier: this._idntifier.serialize(),
      kind: this._kind,
      expression: this._expression.serialize(),
      body: this._body.serialize(),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>) {
    if (stream.read().getText() !== 'foreach') {
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
    const mutable = stream.read().getText() === 'let';
    if (
      stream.read().getText() !== 'const' &&
      stream.read().getText() !== 'let'
    ) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    } else {
      stream.eat();
      this.skipSpace(stream);
    }
    const identifier = LiteralIdentifier.read(stream);
    if (!identifier) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    const kind = stream.read().getText() === 'in' ? 'in' : 'of';
    if (stream.read().getText() !== 'in' && stream.read().getText() !== 'of') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
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
    return new StatementForeach(
      mutable,
      identifier,
      kind,
      expression,
      body,
      begin,
      end,
      stream.getSource(),
    );
  }
}
