import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from './NeocToken.js';

export class ExpressionMember extends Expression {
  private _host: Expression;
  private _field: string;
  private constructor(
    host: Expression,
    field: string,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_MEMBER, begin, end, stream);
    this._host = host;
    this._field = field;
  }
  public getHost(): Expression {
    return this._host;
  }
  public getField(): string {
    return this._field;
  }
  public override serialize(): Record<string, unknown> {
    return {
      type: this.getType(),
      host: this._host.serialize(),
      field: this._field,
    };
  }
  public static read(
    host: Expression,
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = host.getBeginToken();
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
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    const end = stream.read();
    return new ExpressionMember(
      host,
      field.getText(),
      begin,
      end,
      stream.getSource(),
    );
  }
}
