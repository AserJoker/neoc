import type { ILocation } from './ILocation.js';
import type { SourceStream } from './SourceStream.js';
import type { Token } from './Token.js';

export class Node<NodeType, TokenType> {
  private _beginToken: Token<TokenType>;
  private _endToken: Token<TokenType>;
  private _nodeType: NodeType;
  private _stream: SourceStream;
  private _parent: Node<NodeType, TokenType> | undefined = undefined;
  protected constructor(
    nodeType: NodeType,
    begin: Token<TokenType>,
    end: Token<TokenType>,
    stream: SourceStream,
  ) {
    this._nodeType = nodeType;
    this._beginToken = begin;
    this._endToken = end;
    this._stream = stream;
  }
  protected getStream(): SourceStream {
    return this._stream;
  }
  public setParent(parent: Node<NodeType, TokenType>) {
    this._parent = parent;
  }
  public getParent(): Node<NodeType, TokenType> | undefined {
    return this._parent;
  }
  public getBeginToken(): Token<TokenType> {
    return this._beginToken;
  }
  public getEndToken(): Token<TokenType> {
    return this._endToken;
  }
  public getNodeType(): NodeType {
    return this._nodeType;
  }
  public getLocation(): ILocation {
    return {
      begin: this._beginToken.getLocation().begin,
      end: this._endToken.getLocation().begin,
    };
  }
  public getText(): string {
    return this._stream.getText(this.getLocation());
  }
  public serialize(): Record<string, unknown> {
    throw new Error('not implement');
  }
}
