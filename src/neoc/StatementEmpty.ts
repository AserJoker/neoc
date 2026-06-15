import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';
import { Statement } from './Statement.js';

export class StatementEmpty extends Statement {
  private constructor(begin: NeocToken, end: NeocToken, stream: SourceStream) {
    super(NeocNodeType.STATEMENT_EMPTY, begin, end, stream);
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementEmpty | undefined {
    const begin = stream.read();
    if (stream.read().getText() !== ';') {
      return undefined;
    }
    stream.eat();
    const end = stream.read();
    return new StatementEmpty(begin, end, stream.getSource());
  }
}
