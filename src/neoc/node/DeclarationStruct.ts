import { PositionError } from '../../core/PositionError.js';
import type { SourceStream } from '../../core/SourceStream.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { Declaration } from './Declaration.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { NeocNodeType, type NeocNode } from './NeocNode.js';
import type { NeocToken, NeocTokenType } from '../NeocToken.js';
import { Spread } from './Spread.js';
import { StatementDeclaration } from './StatementDeclaration.js';
import { StatementFunction } from './StatementFunction.js';
import { StatementStruct } from './StatementStruct.js';
import { StructField } from './StructField.js';

export class DeclarationStruct extends Declaration {
  private _identifier: LiteralIdentifier | undefined;
  private _fields: NeocNode[] | undefined;
  private _kind: string;
  private constructor(
    identifier: LiteralIdentifier | undefined,
    fields: NeocNode[] | undefined,
    kind: string,
    begin: NeocToken,
    end: NeocToken,
    stream: SourceStream,
  ) {
    super(NeocNodeType.DECLARATION_STRUCT, begin, end, stream);
    this._identifier = identifier;
    this._fields = fields;
    this._kind = kind;
  }
  public getIdentifier(): LiteralIdentifier | undefined {
    return this._identifier;
  }
  public getFields(): NeocNode[] | undefined {
    return this._fields;
  }
  public getKind(): string {
    return this._kind;
  }
  public override serialize(): Record<string, unknown> {
    return {
      nodeType: this.getNodeType(),
      identifier: this._identifier?.serialize?.(),
      fields: this._fields?.map((f) => f.serialize()),
      kind: this._kind,
    };
  }
  public static read(stream: TokenStream<NeocTokenType>) {
    if (
      stream.read().getText() !== 'struct' &&
      stream.read().getText() !== 'union'
    ) {
      return undefined;
    }
    const kind = stream.read().getText();
    const begin = stream.read();
    stream.eat();
    this.skipSpace(stream);
    const identifier = LiteralIdentifier.read(stream);
    this.skipSpace(stream);
    let fields: NeocNode[] | undefined = undefined;
    if (stream.read().getText() === ';') {
      stream.eat();
    } else if (stream.read().getText() === '{') {
      stream.eat();
      this.skipSpace(stream);
      fields = [];
      if (stream.read().getText() !== '}') {
        while (true) {
          this.skipSpace(stream);
          let field: NeocNode | undefined = StructField.read(stream);
          if (!field) {
            field = StatementFunction.read(stream);
          }
          if (!field) {
            field = StatementStruct.read(stream);
          }
          if (!field) {
            field = StatementDeclaration.read(stream);
          }
          if (stream.read().getText() === '...') {
            field = Spread.read(stream);
            this.skipSpace(stream);
            if (stream.read().getText() !== ';') {
              throw new PositionError(
                'Unexpected or invalid token',
                stream.getFilename(),
                stream.read().getLocation().begin,
              );
            }
            stream.eat();
          }
          if (!field) {
            throw new PositionError(
              'Unexpected or invalid token',
              stream.getFilename(),
              stream.read().getLocation().begin,
            );
          }
          fields.push(field);
          this.skipSpace(stream);
          if (stream.read().getText() === '}') {
            break;
          }
        }
      }
      stream.eat();
    } else {
      throw new PositionError(
        'Unexpected or invalid token',
        stream.getFilename(),
        stream.read().getLocation().begin,
      );
    }
    const end = stream.read();
    return new DeclarationStruct(
      identifier,
      fields,
      kind,
      begin,
      end,
      stream.getSource(),
    );
  }
}
