import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';
import type { Statement } from './Statement.js';
import { readStatement } from './StatementHelper.js';

export class SwitchMatch extends NeocNode {
  private _conditions: Expression[];
  private _body: Statement;
  private constructor(
    conditions: Expression[],
    body: Statement,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.SWITCH_MATCH, begin, end, stream);
    this._conditions = conditions;
    this._body = body;
  }
  public getConditions(): Expression[] {
    return this._conditions;
  }
  public getBody(): Statement {
    return this._body;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      conditions: this._conditions.map((con) => con.serialize()),
      body: this._body.serialize(),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>): SwitchMatch {
    const begin = stream.read();
    const conditions: Expression[] = [];
    if (stream.read().getText() === '(') {
      stream.eat();
      this.skipSpace(stream);
      if (stream.read().getText() !== ')') {
        while (true) {
          const condition = ExpressionCondition.read(stream);
          if (!condition) {
            throw new PositionError(
              'Unexpected or invalid token',
              stream.getFilename(),
              stream.read().getLocation().begin,
            );
          }
          conditions.push(condition);
          this.skipSpace(stream);
          if (stream.read().getText() === ',') {
            stream.eat();
            this.skipSpace(stream);
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
    } else if (stream.read().getText() !== '_') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== '->') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    const body = readStatement(stream);
    if (!body) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new SwitchMatch(conditions, body, begin, end, stream.getSource());
  }
}
