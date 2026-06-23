import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from '../NeocToken.js';

export class FunctionBinding extends NeocNode {
  private _identifier: string;
  private _type: Expression | undefined;
  private _initialize: Expression | undefined;
  private constructor(
    identifier: string,
    type: Expression | undefined,
    initialize: Expression | undefined,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.FUNCTION_BINDING, begin, end, stream);
    this._identifier = identifier;
    this._type = type;
    this._initialize = initialize;
  }
  public getIdentifier(): string {
    return this._identifier;
  }
  public getType(): Expression | undefined {
    return this._type;
  }
  public getInitialize(): Expression | undefined {
    return this._initialize;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      identifier: this._identifier,
      type: this._type?.serialize?.(),
      initialize: this._initialize?.serialize?.(),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>): FunctionBinding {
    const begin = stream.read();
    if (stream.read().getType() !== NeocTokenType.IDENTIFIER) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const identifier = stream.read().getText();
    stream.eat();
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
      this.skipSpace(stream);
    }
    const end = stream.read();
    return new FunctionBinding(
      identifier,
      type,
      initialize,
      begin,
      end,
      stream.getSource(),
    );
  }
}
