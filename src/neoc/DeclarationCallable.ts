import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { CallableArgument } from './CallableArgument.js';
import { CallableBinding } from './CallableBinding.js';
import { Declaration } from './Declaration.js';
import { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';

export class DeclarationCallable extends Declaration {
  private _returnType: Expression;
  private _arguments: CallableArgument[];
  private _bindings: CallableBinding[];
  private constructor(
    returnType: Expression,
    args: CallableArgument[],
    bindings: CallableBinding[],
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_CALLABLE, begin, end, stream);
    this._returnType = returnType;
    this._arguments = args;
    this._bindings = bindings;
  }
  public getReturnType(): Expression {
    return this._returnType;
  }
  public getArguments(): CallableArgument[] {
    return this._arguments;
  }
  public getBindings(): CallableBinding[] {
    return this._bindings;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      returnType: this._returnType.serialize(),
      arguments: this._arguments.map((arg) => arg.serialize()),
      bindings: this._bindings.map((bind) => bind.serialize()),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): DeclarationCallable | undefined {
    if (stream.read().getText() !== 'func') {
      return undefined;
    }
    const begin = stream.read();
    const offset = stream.getOffset();
    stream.eat();
    this.skipSpace(stream);
    const bindings: CallableBinding[] = [];
    if (stream.read().getText() === '[') {
      stream.eat();
      this.skipSpace(stream);
      if (stream.read().getText() !== ']') {
        while (true) {
          this.skipSpace(stream);
          const binding = CallableBinding.read(stream);
          if (!binding) {
            stream.setOffset(offset);
            return undefined;
          }
          bindings.push(binding);
          this.skipSpace(stream);
          if (stream.read().getText() === ',') {
            stream.eat();
          } else if (stream.read().getText() === ']') {
            break;
          } else {
            stream.setOffset(offset);
            return undefined;
          }
        }
      }
      stream.eat();
      this.skipSpace(stream);
    }
    if (stream.read().getText() !== '(') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const args: CallableArgument[] = [];
    if (stream.read().getText() !== ')') {
      while (true) {
        this.skipSpace(stream);
        const arg = CallableArgument.read(stream);
        args.push(arg);
        this.skipSpace(stream);
        if (stream.read().getText() === ',') {
          stream.eat();
        } else if (stream.read().getText() === ')') {
          break;
        } else {
          stream.setOffset(offset);
          return undefined;
        }
      }
    }
    stream.eat();
    this.skipSpace(stream);
    if (stream.read().getText() !== '->') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const type = ExpressionCondition.read(stream);
    if (!type) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new DeclarationCallable(
      type,
      args,
      bindings,
      begin,
      end,
      stream.getSource(),
    );
  }
}
