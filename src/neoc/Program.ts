import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import type { TokenStream } from '../core/TokenStream.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import { NeocToken, NeocTokenType } from './NeocToken.js';
import type { Statement } from './Statement.js';
import { StatementExpression } from './StatementExpression.js';

export class Program extends NeocNode {
  private _statements: Statement[] = [];
  private constructor(
    statements: Statement[],
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.PROGRAM, begin, end, stream);
    this._statements = statements;
  }
  public static read(stream: TokenStream<NeocTokenType>) {
    const begin = stream.getOffset();
    this.skipSpace(stream);
    const statements: Statement[] = [];
    while (true) {
      let sts: Statement | undefined = StatementExpression.read(stream);
      if (!sts) {
        break;
      }
      statements.push(sts);
    }
    this.skipSpace(stream);
    if (stream.read().getType() != NeocTokenType.EOF) {
      throw new PositionError(
        'unexpected statement',
        stream.getFilename(),
        stream.read().getLocation().end,
      );
    }
    const end = stream.getOffset();
    return new Program(
      statements,
      stream.get(begin) as NeocToken,
      stream.get(end) as NeocToken,
      stream.getSource(),
    );
  }
  public getStatements(): Statement[] {
    return this._statements;
  }
  public override serialize(): Record<string, unknown> {
    return {
      type: this.getType(),
      statements: this._statements.map((sts) => sts.serialize()),
    };
  }
}
