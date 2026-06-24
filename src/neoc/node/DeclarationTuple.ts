import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Declaration } from './Declaration.js';
import { ExpressionCondition } from './ExpressionCondition.js';
import { NeocNodeType, type NeocNode } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Spread } from './Spread.js';

export class DeclarationTuple extends Declaration {
  private _items: NeocNode[];
  private constructor(
    items: NeocNode[],
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_TUPLE, begin, end, stream);
    this._items = items;
    this._items.forEach((item) => item.setParent(this));
  }
  public getItems(): NeocNode[] {
    return this._items;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      items: this._items.map((item) => item.serialize()),
    };
  }
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): DeclarationTuple | undefined {
    if (stream.read().getText() !== '<') {
      return undefined;
    }
    const begin = stream.read();
    stream.eat();
    this.skipSpace(stream);
    const items: NeocNode[] = [];
    if (stream.read().getText() === '>') {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    while (true) {
      let item: NeocNode | undefined = Spread.read(stream);
      if (!item) {
        item = ExpressionCondition.read(stream);
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
      } else if (stream.read().getText() === '>') {
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
    const end = stream.read();
    return new DeclarationTuple(items, begin, end, stream.getSource());
  }
}
