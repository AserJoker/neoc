import { LocationError } from '../core/LocationError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from './NeocToken.js';
import { Statement } from './Statement.js';

export class StatementExpression extends Statement {
  private _expression: Expression;
  private constructor(
    expression: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_EXPRESSION, begin, end, stream);
    this._expression = expression;
  }
  public getExpression(): Expression {
    return this._expression;
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementExpression | undefined {
    const begin = stream.read();
    const expr = ExpressionComma.read(stream);
    if (!expr) {
      return undefined;
    }
    this.skipSpace(stream);
    if (stream.read().getText() != ';') {
      throw new LocationError("missing ';'", stream.getFilename(), {
        begin: begin.getLocation().begin,
        end: stream.read().getLocation().end,
      });
    }
    stream.eat();
    const end = stream.read();
    return new StatementExpression(expr, begin, end, stream.getSource());
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      expression: this._expression.serialize(),
    };
  }
}
