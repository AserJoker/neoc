import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { DeclarationEnum } from './DeclarationEnum.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';
import { Statement } from './Statement.js';

export class StatementEnum extends Statement {
  private _enum: DeclarationEnum;
  private _pub: boolean;
  private constructor(
    _enum: DeclarationEnum,
    pub: boolean,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_ENUM, begin, end, stream);
    this._enum = _enum;
    this._pub = pub;
  }
  public getEnum(): DeclarationEnum {
    return this._enum;
  }
  public isPub(): boolean {
    return this._pub;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      pub: this._pub,
      enum: this._enum.serialize(),
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
    const _enum = DeclarationEnum.read(stream);
    if (!_enum) {
      stream.setOffset(offset);
      return undefined;
    }
    const end = stream.read();
    return new StatementEnum(_enum, pub, begin, end, stream.getSource());
  }
}
