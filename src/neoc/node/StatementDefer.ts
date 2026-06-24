import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { FunctionBinding } from './FunctionBinding.js';
import { NeocNodeType } from './NeocNode.js';
import { Statement } from './Statement.js';
import { StatementBlock } from './StatementBlock.js';

export class StatementDefer extends Statement {
  private _bindings: FunctionBinding[];
  private _body: StatementBlock;
  private constructor(
    bindings: FunctionBinding[],
    body: StatementBlock,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_DEFER, begin, end, stream);
    this._bindings = bindings;
    this._body = body;
    this._bindings.forEach((bind) => bind.setParent(this));
    this._body.setParent(this);
  }
  public getBindings(): FunctionBinding[] {
    return this._bindings;
  }
  public getBody(): StatementBlock {
    return this._body;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      bindings: this._bindings.map((bind) => bind.serialize()),
      body: this._body.serialize(),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementDefer | undefined {
    if (stream.read().getText() !== 'defer') {
      return undefined;
    }
    const begin = stream.read();
    stream.eat();
    this.skipSpace(stream);
    const bindings: FunctionBinding[] = [];
    if (stream.read().getText() === '[') {
      stream.eat();
      this.skipSpace(stream);
      if (stream.read().getText() !== ']') {
        while (true) {
          const binding = FunctionBinding.read(stream);
          if (!binding) {
            throw new PositionError(
              'Unexpected or invalid token',
              stream.getFilename(),
              stream.read().getLocation().begin,
            );
          }
          bindings.push(binding);
          this.skipSpace(stream);
          if (stream.read().getText() === ',') {
            stream.eat();
            this.skipSpace(stream);
          } else if (stream.read().getText() === '}') {
            break;
          } else {
            throw new PositionError(
              'Unexpected or invalid token',
              stream.getFilename(),
              stream.read().getLocation().begin,
            );
          }
        }
        stream.eat();
      }
    }
    this.skipSpace(stream);
    const body = StatementBlock.read(stream);
    if (!body) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new StatementDefer(bindings, body, begin, end, stream.getSource());
  }
}
