import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Declaration } from './Declaration.js';
import { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class DeclarationArray extends Declaration {
  private _baseType: Expression;
  private _length: Expression;
  private constructor(
    baseType: Expression,
    length: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_ARRAY, begin, end, stream);
    this._baseType = baseType;
    this._length = length;
    this._baseType.setParent(this);
    this._length.setParent(this);
  }
  public getBaseType(): Expression {
    return this._baseType;
  }
  public getLength(): Expression {
    return this._length;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      baseType: this._baseType.serialize(),
      length: this._length.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    if (stream.read().getText() !== '[') {
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const length = ExpressionComma.read(stream);
    if (!length) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== ']') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
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
    return new DeclarationArray(
      baseType,
      length,
      begin,
      end,
      stream.getSource(),
    );
  }
}
