import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Statement } from './Statement.js';
import { VariableDeclarator } from './VariableDeclarator.js';

export class StatementDeclaration extends Statement {
  private _pub: boolean;
  private _declarators: VariableDeclarator[];
  private constructor(
    pub: boolean,
    declarators: VariableDeclarator[],
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_DECLARATION, begin, end, stream);
    this._pub = pub;
    this._declarators = declarators;
  }
  public isPub(): boolean {
    return this._pub;
  }
  public getDeclarators(): VariableDeclarator[] {
    return this._declarators;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      pub: this._pub,
      declarators: this._declarators.map((dec) => dec.serialize()),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementDeclaration | undefined {
    const begin = stream.read();
    const offset = stream.getOffset();
    const pub = stream.read().getText() === 'pub';
    if (pub) {
      stream.eat();
      this.skipSpace(stream);
    }
    if (stream.read().getText() === 'var') {
      stream.eat();
      this.skipSpace(stream);
    } else {
      stream.setOffset(offset);
      return undefined;
    }
    const declarators: VariableDeclarator[] = [];
    while (true) {
      this.skipSpace(stream);
      const declar = VariableDeclarator.read(stream);
      declarators.push(declar);
      this.skipSpace(stream);
      if (stream.read().getText() === ',') {
        stream.eat();
      } else if (stream.read().getText() === ';') {
        break;
      } else {
        throw new PositionError(
          'Unexpected or invalid token',
          stream.getFilename(),
          stream.read().getLocation().begin,
        );
      }
    }
    stream.eat();
    const end = stream.read();
    return new StatementDeclaration(
      pub,
      declarators,
      begin,
      end,
      stream.getSource(),
    );
  }
}
