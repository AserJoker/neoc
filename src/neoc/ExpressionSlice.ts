import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class ExpressionSlice extends Expression {
  private _host: Expression;
  private _start: Expression | undefined;
  private _end: Expression | undefined;
  private constructor(
    host: Expression,
    start: Expression | undefined,
    end: Expression | undefined,
    begin: NeocToken,
    endToken: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_SLICE, begin, endToken, stream);
    this._host = host;
    this._start = start;
    this._end = end;
  }
  public getHost(): Expression {
    return this._host;
  }
  public getStart(): Expression | undefined {
    return this._start;
  }
  public getEnd(): Expression | undefined {
    return this._end;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      host: this._host.serialize(),
      start: this._start?.serialize?.(),
      end: this._end?.serialize?.(),
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
    const start = ExpressionCondition.read(stream);
    this.skipSpace(stream);
    if (stream.read().getText() !== ':') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const end = ExpressionCondition.read(stream);
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
    return new ExpressionSlice(
      host,
      start,
      end,
      beginToken,
      endToken,
      stream.getSource(),
    );
  }
}
