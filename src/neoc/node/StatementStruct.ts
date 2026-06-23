import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { DeclarationStruct } from './DeclarationStruct.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Statement } from './Statement.js';

export class StatementStruct extends Statement {
  private _struct: DeclarationStruct;
  private _pub: boolean;
  private constructor(
    struct: DeclarationStruct,
    pub: boolean,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_STRUCT, begin, end, stream);
    this._struct = struct;
    this._pub = pub;
  }
  public getStruct(): DeclarationStruct {
    return this._struct;
  }
  public isPub(): boolean {
    return this._pub;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      pub: this._pub,
      struct: this._struct.serialize(),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>) {
    const offset = stream.getOffset();
    const begin = stream.read();
    const pub = stream.read().getText() === 'pub';
    if (pub) {
      stream.eat();
      this.skipSpace(stream);
    }
    const struct = DeclarationStruct.read(stream);
    if (!struct) {
      stream.setOffset(offset);
      return undefined;
    }
    const end = stream.read();
    return new StatementStruct(struct, pub, begin, end, stream.getSource());
  }
}
