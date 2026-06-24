import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class StructField extends NeocNode {
  private _identifier: LiteralIdentifier;
  private _type: Expression;
  private constructor(
    identifier: LiteralIdentifier,
    type: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STRUCT_FIELD, begin, end, stream);
    this._identifier = identifier;
    this._type = type;
    this._identifier.setParent(this);
    this._type.setParent(this);
  }
  public getIdentifier(): LiteralIdentifier {
    return this._identifier;
  }
  public getType(): Expression {
    return this._type;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      identifier: this._identifier.serialize(),
      type: this._type.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StructField | undefined {
    const begin = stream.read();
    const identifier = LiteralIdentifier.read(stream);
    if (!identifier) {
      return undefined;
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== ':') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
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
    this.skipSpace(stream);
    if (stream.read().getText() !== ';') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    const end = stream.read();
    return new StructField(identifier, type, begin, end, stream.getSource());
  }
}
