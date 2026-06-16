import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';
import { Statement } from './Statement.js';
import { SwitchMatch } from './SwitchMatch.js';

/**
 * switch(xxxx) {
 *  (a,b,c) -> {}
 *  d-> {}
 * _ -> {}
 * }
 */
export class StatementSwitch extends Statement {
  private _condition: Expression;
  private _matchs: SwitchMatch[];
  private constructor(
    condition: Expression,
    maches: SwitchMatch[],
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_SWITCH, begin, end, stream);
    this._condition = condition;
    this._matchs = maches;
  }
  public getCondtion(): Expression {
    return this._condition;
  }
  public getMatchs(): SwitchMatch[] {
    return this._matchs;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      condition: this._condition.serialize(),
      matchs: this._matchs.map((mat) => mat.serialize()),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementSwitch | undefined {
    if (stream.read().getText() !== 'switch') {
      return undefined;
    }
    const begin = stream.read();
    stream.eat();
    this.skipSpace(stream);
    if (stream.read().getText() !== '(') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    const condition = ExpressionCondition.read(stream);
    if (!condition) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    if (stream.read().getText() !== ')') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    if (stream.read().getText() !== '{') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    stream.eat();
    this.skipSpace(stream);
    const matchs: SwitchMatch[] = [];
    if (stream.read().getText() !== '}') {
      while (true) {
        const match = SwitchMatch.read(stream);
        matchs.push(match);
        this.skipSpace(stream);
        if (stream.read().getText() === '}') {
          break;
        }
      }
    }
    stream.eat();
    const end = stream.read();
    return new StatementSwitch(
      condition,
      matchs,
      begin,
      end,
      stream.getSource(),
    );
  }
}
