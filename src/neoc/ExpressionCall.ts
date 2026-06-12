import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionAssigment } from './ExpressionAssigment.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class ExpressionCall extends Expression {
  private _callee: Expression;
  private _arguments: Expression[];
  private constructor(
    callee: Expression,
    args: Expression[],
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_CALL, begin, end, stream);
    this._callee = callee;
    this._arguments = args;
  }
  public getCallee(): Expression {
    return this._callee;
  }
  public getArguments(): Expression[] {
    return this._arguments;
  }
  public override serialize(): Record<string, unknown> {
    return {
      type: this.getType(),
      callee: this._callee.serialize(),
      arguments: this._arguments.map((arg) => arg.serialize()),
    };
  }
  public static read(callee: Expression, stream: TokenStream<NeocTokenType>) {
    const begin = callee.getBeginToken();
    const offset = stream.getOffset();
    this.skipSpace(stream);
    if (stream.read().getText() !== '(') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const args: Expression[] = [];
    if (stream.read().getText() !== ')') {
      while (true) {
        this.skipSpace(stream);
        const arg = ExpressionAssigment.read(stream);
        if (!arg) {
          throw new PositionError(
            'Unexpected or invalid token',
            stream.getFilename(),
            stream.read().getLocation().begin,
          );
        }
        args.push(arg);
        this.skipSpace(stream);
        if (stream.read().getText() === ',') {
          stream.eat();
        } else if (stream.read().getText() === ')') {
          break;
        } else {
          throw new PositionError(
            'Unexpected or invalid token',
            stream.getFilename(),
            stream.read().getLocation().begin,
          );
        }
      }
    }
    stream.eat();
    const end = stream.read();
    return new ExpressionCall(callee, args, begin, end, stream.getSource());
  }
}
