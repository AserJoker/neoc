import type { ILocation } from './ILocation.js';
import type { SourceStream } from './SourceStream.js';
import type { Token } from './Token.js';

export class Node<NodeType, TokenType> {
  private _begin: Token<TokenType>;
  private _end: Token<TokenType>;
  private _type: NodeType;
  private _stream: SourceStream;
  protected constructor(
    type: NodeType,
    begin: Token<TokenType>,
    end: Token<TokenType>,
    stream: SourceStream,
  ) {
    this._type = type;
    this._begin = begin;
    this._end = end;
    this._stream = stream;
  }
  protected getStream(): SourceStream {
    return this._stream;
  }
  public getType(): NodeType {
    return this._type;
  }
  public getLocation(): ILocation {
    return {
      begin: this._begin.getLocation().begin,
      end: this._end.getLocation().begin,
    };
  }
  public getText(): string {
    return this._stream.getText(this.getLocation());
  }
  public serialize(): Record<string, unknown> {
    throw new Error('not implement');
  }
}
