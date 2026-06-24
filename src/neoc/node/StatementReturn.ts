import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionComma } from './ExpressionComma.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Statement } from './Statement.js';

export class StatementReturn extends Statement {
  private _expression: Expression | undefined;
  private constructor(
    expression: Expression | undefined,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_RETURN, begin, end, stream);
    this._expression = expression;
    this._expression?.setParent(this);
  }
  public getExpression(): Expression | undefined {
    return this._expression;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      expression: this._expression?.serialize?.(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementReturn | undefined {
    const begin = stream.read();
    if (begin.getText() !== 'return') {
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    let expression: Expression | undefined = undefined;
    if (stream.read().getText() !== ';') {
      expression = ExpressionComma.read(stream);
      this.skipSpace(stream);
    }
    if (stream.read().getText() !== ';') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    const end = stream.read();
    return new StatementReturn(expression, begin, end, stream.getSource());
  }
}
