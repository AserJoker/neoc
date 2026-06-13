import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { Expression } from './Expression.js';
import { ExpressionPost } from './ExpressionPost.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class ExpressionBinary extends Expression {
  private _opt: NeocToken;
  private _left: Expression | undefined;
  private _right: Expression;
  private constructor(
    opt: NeocToken,
    left: Expression | undefined,
    right: Expression,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.EXPRESSION_BINARY, begin, end, stream);
    this._opt = opt;
    this._left = left;
    this._right = right;
  }
  public getOpt(): NeocToken {
    return this._opt;
  }
  public getLeft(): Expression | undefined {
    return this._left;
  }
  public getRight(): Expression {
    return this._right;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      left: this._left?.serialize?.(),
      right: this._right.serialize(),
      opt: this._opt.getText(),
    };
  }
  private static readLogicalOr(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readLogicalAnd(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '||') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readLogicalOr(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readLogicalAnd(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readBitwiseOr(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '&&') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readLogicalAnd(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readBitwiseOr(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readBitwiseXor(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '|') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readBitwiseOr(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readBitwiseXor(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readBitwiseAnd(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '^') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readBitwiseXor(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readBitwiseAnd(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readEqual(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '&') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readBitwiseAnd(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readEqual(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readReleaction(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '==' && opt.getText() != '!=') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readEqual(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readReleaction(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readBitwiseShift(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (
      opt.getText() != '>' &&
      opt.getText() != '<' &&
      opt.getText() != '>=' &&
      opt.getText() != '<='
    ) {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readReleaction(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readBitwiseShift(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readAdditive(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '>>' && opt.getText() != '<<') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readBitwiseShift(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readAdditive(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readMultiplicative(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '+' && opt.getText() != '-') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readAdditive(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readMultiplicative(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const left = this.readPrefix(stream);
    if (!left) {
      return undefined;
    }
    const offset = stream.getOffset();
    this.skipSpace(stream);
    const opt = stream.read();
    if (opt.getText() != '*' && opt.getText() != '/' && opt.getText() != '%') {
      stream.setOffset(offset);
      return left;
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readMultiplicative(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      left,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  private static readPrefix(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    const begin = stream.read();
    const opt = stream.read();
    if (
      opt.getText() !== '+' &&
      opt.getText() !== '-' &&
      opt.getText() !== '!' &&
      opt.getText() !== '~'
    ) {
      return ExpressionPost.read(stream);
    }
    stream.eat();
    this.skipSpace(stream);
    const right = this.readPrefix(stream);
    if (!right) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new ExpressionBinary(
      opt,
      undefined,
      right,
      begin,
      end,
      stream.getSource(),
    );
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    return this.readLogicalOr(stream);
  }
}
