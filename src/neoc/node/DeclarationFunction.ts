import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Declaration } from './Declaration.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { FunctionArgument } from './FunctionAragument.js';
import { FunctionBinding } from './FunctionBinding.js';
import { NeocNodeType } from './NeocNode.js';
import { NeocTokenType, type NeocToken } from '../NeocToken.js';
import { StatementBlock } from './StatementBlock.js';

export class DeclarationFunction extends Declaration {
  private _kind: string | undefined;
  private _identifier: string | undefined;
  private _arguments: FunctionArgument[];
  private _bindings: FunctionBinding[];
  private _returnType: Expression;
  private _body: StatementBlock | undefined;
  private constructor(
    kind: string | undefined,
    identifier: string | undefined,
    args: FunctionArgument[],
    bindings: FunctionBinding[],
    returnType: Expression,
    body: StatementBlock | undefined,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_FUNCTION, begin, end, stream);
    this._kind = kind;
    this._identifier = identifier;
    this._arguments = args;
    this._bindings = bindings;
    this._returnType = returnType;
    this._body = body;
    this._arguments.forEach((arg) => arg.setParent(this));
    this._bindings.forEach((bind) => bind.setParent(this));
    this._returnType.setParent(this);
    this._body?.setParent(this);
  }
  public getKind(): string | undefined {
    return this._kind;
  }
  public getIdentifier(): string | undefined {
    return this._identifier;
  }
  public getArguments(): FunctionArgument[] {
    return this._arguments;
  }
  public getBindings(): FunctionBinding[] {
    return this._bindings;
  }
  public getReturnType(): Expression {
    return this._returnType;
  }

  public getBody(): StatementBlock | undefined {
    return this._body;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      kind: this._kind,
      identifier: this._identifier,
      arguments: this._arguments.map((arg) => arg.serialize()),
      bindings: this._bindings.map((bind) => bind.serialize()),
      returnType: this._returnType.serialize(),
      body: this._body?.serialize?.(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): DeclarationFunction | undefined {
    const begin = stream.read();
    const offset = stream.getOffset();
    let kind: string | undefined = undefined;
    if (['inline', 'extern', 'comptime'].includes(stream.read().getText())) {
      kind = stream.read().getText();
      stream.eat();
      this.skipSpace(stream);
    }
    if (stream.read().getText() !== 'func') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const bindings: FunctionBinding[] = [];
    if (stream.read().getText() === '[') {
      stream.eat();
      this.skipSpace(stream);
      if (stream.read().getText() !== ']') {
        while (true) {
          this.skipSpace(stream);
          const bind = FunctionBinding.read(stream);
          bindings.push(bind);
          this.skipSpace(stream);
          if (stream.read().getText() === ']') {
            break;
          } else if (stream.read().getText() === ',') {
            stream.eat();
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
      this.skipSpace(stream);
    }
    let identifier: string | undefined = undefined;
    if (stream.read().getType() === NeocTokenType.IDENTIFIER) {
      identifier = stream.read().getText();
      stream.eat();
      this.skipSpace(stream);
    }
    const args: FunctionArgument[] = [];
    if (stream.read().getText() !== '(') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    if (stream.read().getText() !== ')') {
      while (true) {
        this.skipSpace(stream);
        const arg = FunctionArgument.read(stream);
        args.push(arg);
        this.skipSpace(stream);
        if (stream.read().getText() === ')') {
          break;
        } else if (stream.read().getText() === ',') {
          stream.eat();
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
    this.skipSpace(stream);
    if (stream.read().getText() !== ':') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    const returnType = ExpressionCondition.read(stream);
    if (!returnType) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    let body: StatementBlock | undefined = undefined;
    if (stream.read().getText() !== ';') {
      body = StatementBlock.read(stream);
      if (!body) {
        throw new PositionError(
          'Unexpected or invalid token',
          stream.getFilename(),
          stream.read().getLocation().begin,
        );
      }
    }
    const end = stream.read();
    return new DeclarationFunction(
      kind,
      identifier,
      args,
      bindings,
      returnType,
      body,
      begin,
      end,
      stream.getSource(),
    );
  }
}
