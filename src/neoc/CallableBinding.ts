import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class CallableBinding extends NeocNode {
  private _type: Expression;
  private _identifier: LiteralIdentifier;
  private _mutable: boolean;
  private constructor(
    type: Expression,
    identifier: LiteralIdentifier,
    mutable: boolean,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.CALLABLE_BINDING, begin, end, stream);
    this._type = type;
    this._identifier = identifier;
    this._mutable = mutable;
  }
  public getType(): Expression {
    return this._type;
  }
  public getIdentifier(): LiteralIdentifier {
    return this._identifier;
  }
  public isMutable(): boolean {
    return this._mutable;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      mutable: this._mutable,
      identifier: this._identifier.serialize(),
      type: this._type.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): CallableBinding | undefined {
    const begin = stream.read();
    const offset = stream.getOffset();
    const mutable = stream.read().getText() !== 'const';
    if (!mutable) {
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
    if (stream.read().getText() !== ':') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const type = ExpressionCondition.read(stream);
    if (!type) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new CallableBinding(
      type,
      identifier,
      mutable,
      begin,
      end,
      stream.getSource(),
    );
  }
}
