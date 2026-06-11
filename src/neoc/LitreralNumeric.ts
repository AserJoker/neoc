import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Literal } from './LIteral.js';
import { NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from './NeocToken.js';

export class LiteralNumeric extends Literal {
  private constructor(begin: NeocToken, end: NeocToken, stream: SourceStream) {
    super(NeocNodeType.LITERAL_NUMERIC, begin, end, stream);
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): LiteralNumeric | undefined {
    if (stream.read().getType() == NeocTokenType.NUMERIC) {
      const token = stream.read();
      stream.eat();
      if (stream.read().getType() == NeocTokenType.IDENTIFIER) {
        stream.eat();
      }
      return new LiteralNumeric(token, stream.read(), stream.getSource());
    }
    return undefined;
  }
  public override serialize(): Record<string, unknown> {
    return {
      type: this.getType(),
      text: this.getText(),
    };
  }
}
