import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionCall } from './ExpressionCall.js';
import { ExpressionComputeMember } from './ExpressionComputeMember.js';
import { ExpressionMember } from './ExpressionMember.js';
import { ExpressionSlice } from './ExpressionSlice.js';
import { ExpressionValue } from './ExpressionValue.js';
import type { NeocTokenType } from './NeocToken.js';

export class ExpressionPost extends Expression {
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    let expr = ExpressionValue.read(stream);
    if (expr) {
      while (true) {
        let next = ExpressionMember.read(expr, stream);
        if (!next) {
          next = ExpressionCall.read(expr, stream);
        }
        if (!next) {
          next = ExpressionSlice.read(expr, stream);
        }
        if (!next) {
          next = ExpressionComputeMember.read(expr, stream);
        }
        if (!next) {
          break;
        }
        expr = next;
      }
    }
    return expr;
  }
}
