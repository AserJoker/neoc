import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Declaration } from './Declaration.js';
import { EnumItem } from './EnumItem.js';
import type { Expression } from './Expression.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { NeocNode, NeocNodeType } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Spread } from './Spread.js';

export class DeclarationEnum extends Declaration {
  private _items: NeocNode[] | undefined;
  private _identifier: LiteralIdentifier;
  private _type: Expression | undefined;
  private constructor(
    identifier: LiteralIdentifier,
    type: Expression | undefined,
    items: NeocNode[] | undefined,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_ENUM, begin, end, stream);
    this._identifier = identifier;
    this._type = type;
    this._items = items;
  }
  public getIdentifier(): LiteralIdentifier {
    return this._identifier;
  }
  public getType(): Expression | undefined {
    return this._type;
  }
  public getItems(): NeocNode[] | undefined {
    return this._items;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      identifier: this._identifier.serialize(),
      type: this._type?.serialize(),
      items: this._items?.map((item) => item.serialize()),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): DeclarationEnum | undefined {
    if (stream.read().getText() !== 'enum') {
      return undefined;
    }
    const begin = stream.read();
    stream.eat();
    this.skipSpace(stream);
    const identifier = LiteralIdentifier.read(stream);
    if (!identifier) {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    this.skipSpace(stream);
    let type: Expression | undefined = undefined;
    if (stream.read().getText() === ':') {
      stream.eat();
      this.skipSpace(stream);
      type = ExpressionCondition.read(stream);
      if (!type) {
        throw new PositionError(
          'Unexpected or invalid token',
          stream.getFilename(),
          stream.read().getLocation().begin,
        );
      }
    }
    let items: NeocNode[] | undefined = undefined;
    this.skipSpace(stream);
    if (stream.read().getText() === '{') {
      stream.eat();
      this.skipSpace(stream);
      items = [];
      if (stream.read().getText() !== '}') {
        while (true) {
          let item: NeocNode | undefined = EnumItem.read(stream);
          if (!item) {
            item = Spread.read(stream);
          }
          if (!item) {
            throw new PositionError(
              'Unexpected or invalid token',
              stream.getFilename(),
              stream.read().getLocation().begin,
            );
          }
          items.push(item);
          this.skipSpace(stream);
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
    } else if (stream.read().getText() === ';') {
      stream.eat();
    } else {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new DeclarationEnum(
      identifier,
      type,
      items,
      begin,
      end,
      stream.getSource(),
    );
  }
}
