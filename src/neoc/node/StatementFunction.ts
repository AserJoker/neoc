import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { DeclarationFunction } from './DeclarationFunction.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Statement } from './Statement.js';

export class StatementFunction extends Statement {
  private _declaration: DeclarationFunction;
  private _pub: boolean;
  private constructor(
    pub: boolean,
    declaration: DeclarationFunction,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_FUNCTION, begin, end, stream);
    this._pub = pub;
    this._declaration = declaration;
  }
  public getDeclaration(): DeclarationFunction {
    return this._declaration;
  }
  public isPub(): boolean {
    return this._pub;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      pub: this._pub,
      declaration: this._declaration.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementFunction | undefined {
    const begin = stream.read();
    const offset = stream.getOffset();
    const pub = stream.read().getText() === 'pub';
    if (pub) {
      stream.eat();
      this.skipSpace(stream);
    }
    const declaration = DeclarationFunction.read(stream);
    if (!declaration) {
      stream.setOffset(offset);
      return undefined;
    }
    const end = stream.read();
    return new StatementFunction(
      pub,
      declaration,
      begin,
      end,
      stream.getSource(),
    );
  }
}
