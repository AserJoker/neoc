import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Declaration } from './Declaration.js';
import { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class DeclarationSlice extends Declaration {
  private _baseType: Expression;
  private constructor(
    baseType: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_SLICE, begin, end, stream);
    this._baseType = baseType;
    this._baseType.setParent(this);
  }
  public getBaseType(): Expression {
    return this._baseType;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      baseType: this._baseType.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const offset = stream.getOffset();
    if (stream.read().getText() !== '[') {
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    if (stream.read().getText() !== ']') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const baseType = ExpressionCondition.read(stream);
    if (!baseType) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new DeclarationSlice(baseType, begin, end, stream.getSource());
  }
}
