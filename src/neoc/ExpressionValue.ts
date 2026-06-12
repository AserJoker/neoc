import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { LiteralString } from './LiteralString.js';
import { LiteralNumeric } from './LitreralNumeric.js';
import type { NeocTokenType } from './NeocToken.js';

export class ExpressionValue extends Expression {
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    let expr: Expression | undefined = LiteralString.read(stream);
    if (!expr) {
      expr = LiteralNumeric.read(stream);
    }
    if (!expr) {
      expr = LiteralNumeric.read(stream);
    }
    if (!expr) {
      expr = LiteralIdentifier.read(stream);
    }
    return expr;
  }
}
