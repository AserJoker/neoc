import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from './NeocToken.js';

export class ExpressionMember extends Expression {
  private _host: Expression | undefined;
  private _field: NeocToken;
  private constructor(
    host: Expression | undefined,
    field: NeocToken,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_MEMBER, begin, end, stream);
    this._host = host;
    this._field = field;
  }
  public getHost(): Expression | undefined {
    return this._host;
  }
  public getField(): NeocToken {
    return this._field;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      host: this._host?.serialize?.(),
      field: this._field.getText(),
    };
  }
  public static read(
    host: Expression | undefined,
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = host ? host.getBeginToken() : stream.read();
    const offset = stream.getOffset();
    this.skipSpace(stream);
    if (stream.read().getText() !== '.') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const field = stream.read();
    if (field.getType() !== NeocTokenType.IDENTIFIER) {
      if (
        field.getType() !== NeocTokenType.SYMBOL ||
        (field.getText() !== '&' && field.getText() !== '*')
      ) {
        throw new PositionError(
          'Unexpected or invalid token',
          stream.getFilename(),
          stream.read().getLocation().begin,
        );
      }
    }
    stream.eat();
    const end = stream.read();
    return new ExpressionMember(host, field, begin, end, stream.getSource());
  }
}
