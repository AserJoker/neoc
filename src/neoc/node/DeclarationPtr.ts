import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Declaration } from './Declaration.js';
import { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class DeclarationPtr extends Declaration {
  private _array: boolean;
  private _mutable: boolean;
  private _volatile: boolean;
  private _baseType: Expression;
  private constructor(
    array: boolean,
    mutable: boolean,
    volatile: boolean,
    baseType: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_PTR, begin, end, stream);
    this._array = array;
    this._mutable = mutable;
    this._volatile = volatile;
    this._baseType = baseType;
  }
  public isArray(): boolean {
    return this._array;
  }
  public isMutable(): boolean {
    return this._mutable;
  }
  public isVolatile(): boolean {
    return this._volatile;
  }
  public getBaseType(): Expression {
    return this._baseType;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      array: this._array,
      mutable: this._mutable,
      volatile: this._volatile,
      baseType: this._baseType.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    if (stream.read().getText() !== '*' && stream.read().getText() !== '[*]') {
      return undefined;
    }
    const array = stream.read().getText() === '[*]';
    stream.eat();
    this.skipSpace(stream);
    const decorators: string[] = [];
    while (['const', 'volatile'].includes(stream.read().getText())) {
      decorators.push(stream.read().getText());
      stream.eat();
      this.skipSpace(stream);
    }
    const mutable = !decorators.includes('const');
    const volatile = decorators.includes('volatile');
    const baseType = ExpressionCondition.read(stream);
    if (!baseType) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new DeclarationPtr(
      array,
      mutable,
      volatile,
      baseType,
      begin,
      end,
      stream.getSource(),
    );
  }
}
