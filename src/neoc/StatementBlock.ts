import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from './NeocToken.js';
import { Statement } from './Statement.js';
import { StatementExpression } from './StatementExpression.js';
import { StatementReturn } from './StatementReturn.js';

export class StatementBlock extends Statement {
  private _statements: Statement[];
  private constructor(
    statements: Statement[],
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.STATEMENT_BLOCK, begin, end, stream);
    this._statements = statements;
  }
  public getStatements(): Statement[] {
    return this._statements;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      statements: this._statements.map((sts) => sts.serialize()),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): StatementBlock | undefined {
    if (stream.read().getText() !== '{') {
      return undefined;
    }
    const begin = stream.read();
    stream.eat();
    this.skipSpace(stream);
    const statements: Statement[] = [];
    if (stream.read().getText() !== '}') {
      while (true) {
        this.skipSpace(stream);
        let sts: Statement | undefined = StatementBlock.read(stream);
        if (!sts) {
          sts = StatementExpression.read(stream);
        }
        if (!sts) {
          sts = StatementReturn.read(stream);
        }
        if (!sts) {
          throw new PositionError(
            'Unexpected or invalid token',
            stream.getFilename(),
            stream.read().getLocation().begin,
          );
        }
        statements.push(sts);
        this.skipSpace(stream);
        if (stream.read().getText() === '}') {
          break;
        }
      }
    }
    stream.eat();
    const end = stream.read();
    return new StatementBlock(statements, begin, end, stream.getSource());
  }
}
