import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class CallableArgument extends NeocNode {
  private _type: Expression | undefined;
  private _mutable: boolean;
  private _rest: boolean;
  public constructor(
    type: Expression | undefined,
    mutable: boolean,
    rest: boolean,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.CALLABLE_ARGUMENT, begin, end, stream);
    this._type = type;
    this._mutable = mutable;
    this._rest = rest;
  }
  public getType(): Expression | undefined {
    return this._type;
  }
  public isMutable(): boolean {
    return this._mutable;
  }
  public isRest(): boolean {
    return this._rest;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      type: this._type?.serialize?.(),
      mutable: this._mutable,
      rest: this._rest,
    };
  }
  public static read(stream: TokenStream<NeocTokenType>) {
    const begin = stream.read();
    const mutable = stream.read().getText() !== 'const';
    if (!mutable) {
      stream.eat();
      this.skipSpace(stream);
    }
    const rest = stream.read().getText() === '...';
    if (rest) {
      stream.eat();
      this.skipSpace(stream);
    }
    const type = ExpressionCondition.read(stream);
    if (!type && (!rest || !mutable)) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new CallableArgument(
      type,
      mutable,
      rest,
      begin,
      end,
      stream.getSource(),
    );
  }
}
