import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class InitializeListField extends NeocNode {
  private _identifier: LiteralIdentifier;
  private _initialize: Expression;
  private constructor(
    identifier: LiteralIdentifier,
    initialize: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.INITIALIZE_LIST_FIELD, begin, end, stream);
    this._identifier = identifier;
    this._initialize = initialize;
  }
  public getIdentifier(): LiteralIdentifier {
    return this._identifier;
  }
  public getInitialize(): Expression {
    return this._initialize;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      identifier: this._identifier.serialize(),
      initialize: this._initialize.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): InitializeListField | undefined {
    const begin = stream.read();
    if (stream.read().getText() !== '.') {
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const identifier = LiteralIdentifier.read(stream);
    if (!identifier) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== '=') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    const initialize = ExpressionCondition.read(stream);
    if (!initialize) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new InitializeListField(
      identifier,
      initialize,
      begin,
      end,
      stream.getSource(),
    );
  }
}
