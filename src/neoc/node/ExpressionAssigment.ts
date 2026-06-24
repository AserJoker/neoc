import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionBinary } from './ExpressionBinary.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';

export class ExpressionAssigment extends Expression {
  private _opt: string;
  private _left: Expression;
  private _right: Expression;
  private constructor(
    opt: string,
    left: Expression,
    right: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_ASSIGMENT, begin, end, stream);
    this._opt = opt;
    this._left = left;
    this._right = right;
    this._left.setParent(this);
    this._right.setParent(this);
  }
  public getOpt(): string {
    return this._opt;
  }
  public getLeft(): Expression {
    return this._left;
  }
  public getRight(): Expression {
    return this._right;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      left: this._left.serialize(),
      opt: this._opt,
      right: this._right.serialize(),
    };
  }
  private static opts = [
    '=',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
    '>>=',
    '<<=',
    '&=',
    '|=',
    '^=',
    '&&=',
    '||=',
    '??=',
  ];
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = ExpressionBinary.read(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read().getText();
    if (!this.opts.includes(opt)) {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = ExpressionCondition.read(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionAssigment(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
}
