import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class EnumItem extends NeocNode {
  private _identifier: LiteralIdentifier;
  private _initialize: Expression | undefined;
  private constructor(
    identifier: LiteralIdentifier,
    initialize: Expression | undefined,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.ENUM_ITEM, begin, end, stream);
    this._identifier = identifier;
    this._initialize = initialize;
  }
  public getIdentifier(): LiteralIdentifier {
    return this._identifier;
  }
  public getInitialize(): Expression | undefined {
    return this._initialize;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      identifier: this._identifier.serialize(),
      initialize: this._initialize?.serialize(),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>) {
    const begin = stream.read();
    const identifier = LiteralIdentifier.read(stream);
    if (!identifier) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    let initialize: Expression | undefined = undefined;
    if (stream.read().getText() === '=') {
      stream.eat();
      this.skipSpace(stream);
      initialize = ExpressionCondition.read(stream);
      if (!initialize) {
        throw new PositionError(
          'Unexpected or invalid token',
          stream.getFilename(),
          stream.read().getLocation().begin,
        );
      }
    } else {
      stream.setOffset(offset);
    }
    const end = stream.read();
    return new EnumItem(identifier, initialize, begin, end, stream.getSource());
  }
}
