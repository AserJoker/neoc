import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from './NeocToken.js';

export class FunctionArgument extends NeocNode {
  private _mutable: boolean;
  private _identifier: string | undefined;
  private _type: Expression | undefined;
  private _rest: boolean;
  private constructor(
    mutable: boolean,
    identifier: string | undefined,
    type: Expression | undefined,
    rest: boolean,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.FUNCTION_ARGUMENT, begin, end, stream);
    this._mutable = mutable;
    this._identifier = identifier;
    this._type = type;
    this._rest = rest;
  }
  public isMutable(): boolean {
    return this._mutable;
  }
  public getIdentifier(): string | undefined {
    return this._identifier;
  }
  public getType(): Expression | undefined {
    return this._type;
  }
  public isRest(): boolean {
    return this._rest;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      mutable: this._mutable,
      identifier: this._identifier,
      type: this._type?.serialize?.(),
      rest: this._rest,
    };
  }
  public static read(stream: TokenStream<NeocTokenType>): FunctionArgument {
    const begin = stream.read();
    const rest = stream.read().getText() === '...';
    if (rest) {
      stream.eat();
      this.skipSpace(stream);
    }
    let mutable: boolean = true;
    let identifier: string | undefined = undefined;
    let type: Expression | undefined = undefined;
    if (stream.read().getType() === NeocTokenType.IDENTIFIER) {
      identifier = stream.read().getText();
      stream.eat();
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
      mutable = stream.read().getText() !== 'const';
      if (!mutable) {
        stream.eat();
        this.skipSpace(stream);
      }
      type = ExpressionCondition.read(stream);
      if (!type) {
        throw new PositionError(
          'Unexpected or invalid token',
          stream.getFilename(),
          stream.read().getLocation().begin,
        );
      }
    }
    const end = stream.read();
    return new FunctionArgument(
      mutable,
      identifier,
      type,
      rest,
      begin,
      end,
      stream.getSource(),
    );
  }
}
