import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Literal } from './LIteral.js';
import { NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from './NeocToken.js';

export class LiteralString extends Literal {
  private constructor(begin: NeocToken, end: NeocToken, stream: SourceStream) {
    super(NeocNodeType.LITERAL_STRING, begin, end, stream);
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): LiteralString | undefined {
    if (stream.read().getType() == NeocTokenType.STRING) {
      const token = stream.read();
      stream.eat();
      return new LiteralString(token, stream.read(), stream.getSource());
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
