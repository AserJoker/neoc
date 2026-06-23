import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Declaration } from './Declaration.js';
import { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { InitializeListField } from './InitializeListField.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Spread } from './Spread.js';

export class DeclarationInitializeList extends Declaration {
  private _fields: NeocNode[];
  private _type: Expression | undefined;
  private constructor(
    type: Expression | undefined,
    fields: NeocNode[],
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_INITIALIZE_LIST, begin, end, stream);
    this._type = type;
    this._fields = fields;
  }
  public getType(): Expression | undefined {
    return this._type;
  }
  public getFields(): NeocNode[] {
    return this._fields;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      type: this._type?.serialize?.(),
      fields: this._fields.map((f) => f.serialize()),
    };
  }
  public static read(stream: TokenStream<NeocTokenType>) {
    if (stream.read().getText() !== '.') {
      return undefined;
    }
    const begin = stream.read();
    const offset = stream.getOffset();
    stream.eat();
    this.skipSpace(stream);
    const type = ExpressionCondition.read(stream);
    this.skipSpace(stream);
    if (stream.read().getText() !== '{') {
      stream.setOffset(offset);
      return undefined;
    }
    stream.eat();
    this.skipSpace(stream);
    const fields: NeocNode[] = [];
    if (stream.read().getText() !== '}') {
      while (true) {
        let field: NeocNode | undefined = InitializeListField.read(stream);
        if (!field) {
          field = ExpressionCondition.read(stream);
        }
        if (!field) {
          field = Spread.read(stream);
        }
        if (!field) {
          throw new PositionError(
            'Unexpected or invalid token',
            stream.getFilename(),
            stream.read().getLocation().begin,
          );
        }
        fields.push(field);
        if (stream.read().getText() === ',') {
          stream.eat();
          this.skipSpace(stream);
          if (stream.read().getText() === '}') {
            break;
          }
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
    }
    stream.eat();
    const end = stream.read();
    return new DeclarationInitializeList(
      type,
      fields,
      begin,
      end,
      stream.getSource(),
    );
  }
}
