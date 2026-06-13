import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Literal } from './LIteral.js';
import { NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from './NeocToken.js';

export class LiteralIdentifier extends Literal {
  private constructor(begin: NeocToken, end: NeocToken, stream: SourceStream) {
    super(NeocNodeType.LITERAL_IDENTIFIER, begin, end, stream);
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): LiteralIdentifier | undefined {
    if (stream.read().getType() == NeocTokenType.IDENTIFIER) {
      const token = stream.read();
      stream.eat();
      return new LiteralIdentifier(token, stream.read(), stream.getSource());
    }
    return undefined;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      text: this.getText(),
    };
  }
}
