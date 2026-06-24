import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from '../NeocToken.js';

export class VariableDeclarator extends NeocNode {
  private _identifier: LiteralIdentifier;
  private _type: Expression | undefined;
  private _initialzie: Expression;
  private constructor(
    identifier: LiteralIdentifier,
    type: Expression | undefined,
    initialize: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.VARIABLE_DECLARATOR, begin, end, stream);
    this._identifier = identifier;
    this._type = type;
    this._initialzie = initialize;
    this._identifier.setParent(this);
    this._type?.setParent(this);
    this._initialzie.setParent(this);
  }
  public getIdentifier(): LiteralIdentifier {
    return this._identifier;
  }
  public getType(): Expression | undefined {
    return this._type;
  }
  public getInitialzie(): Expression {
    return this._initialzie;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      identifier: this._identifier.serialize(),
      type: this._type?.serialize?.(),
      initialize: this._initialzie.serialize(),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>): VariableDeclarator {
    const begin = stream.read();
    const identifier = LiteralIdentifier.read(stream);
    if (!identifier) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    let type: Expression | undefined = undefined;
    if (stream.read().getText() === ':') {
      stream.eat();
      this.skipSpace(stream);
      type = ExpressionCondition.read(stream);
      if (!type) {
        throw new PositionError(
          'Unexpected or invalid token',
          stream.getFilename(),
          stream.read().getLocation().begin,
        );
      }
      this.skipSpace(stream);
    }
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
    return new VariableDeclarator(
      identifier,
      type,
      initialize,
      begin,
      end,
      stream.getSource(),
    );
  }
}
