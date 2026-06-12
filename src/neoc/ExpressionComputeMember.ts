import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionAssigment } from './ExpressionAssigment.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class ExpressionComputeMember extends Expression {
  private _host: Expression;
  private _field: Expression;
  private constructor(
    host: Expression,
    field: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_COMPUTE_MEMBER, begin, end, stream);
    this._host = host;
    this._field = field;
  }
  public getHost(): Expression {
    return this._host;
  }
  public getField(): Expression {
    return this._field;
  }
  public override serialize(): Record<string, unknown> {
    return {
      type: this.getType(),
      host: this._host.serialize(),
      field: this._field.serialize(),
    };
  }
  public static read(host: Expression, stream: TokenStream<NeocTokenType>) {
    const beginToken = host.getBeginToken();
    const offset = stream.getOffset();
    this.skipSpace(stream);
    if (stream.read().getText() !== '[') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const field = ExpressionAssigment.read(stream);
    if (!field) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== ']') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    const endToken = stream.read();
    return new ExpressionComputeMember(
      host,
      field,
      beginToken,
      endToken,
      stream.getSource(),
    );
  }
}
