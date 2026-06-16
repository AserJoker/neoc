import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';
import { Statement } from './Statement.js';

export class StatementContinue extends Statement {
  private constructor(begin: NeocToken, end: NeocToken, stream: SourceStream) {
    super(NeocNodeType.STATEMENT_CONTINUE, begin, end, stream);
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementContinue | undefined {
    const begin = stream.read();
    if (stream.read().getText() !== 'continue') {
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    if (stream.read().getText() !== ';') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    const end = stream.read();
    return new StatementContinue(begin, end, stream.getSource());
  }
}
