import type { SourceStream } from './SourceStream.js';
import type { Token } from './Token.js';

export class TokenStream<TokenType> {
  private _tokens: Token<TokenType>[];
  private _offset = 0;
  private _source: SourceStream;
  public constructor(tokens: Token<TokenType>[], source: SourceStream) {
    this._tokens = tokens;
    this._source = source;
  }
  public read(): Token<TokenType> {
    return this._tokens[this._offset] as Token<TokenType>;
  }
  public get(offset: number): Token<TokenType> | undefined {
    return this._tokens[offset];
  }
  public eat(): void {
    if (this._offset < this._tokens.length) {
      this._offset++;
    }
  }
  public getOffset(): number {
    return this._offset;
  }
  public setOffset(offset: number): void {
    this._offset = offset;
  }
  public getFilename(): string {
    return this._source.getFilename();
  }
  public getSource(): SourceStream {
    return this._source;
  }
  public insert(token: Token<TokenType>): void {
    if (this._offset < this._tokens.length) {
      this._tokens.splice(this._offset, 0, token);
    }
  }
  public push(token: Token<TokenType>): void {
    this._tokens.push(token);
  }
  public remove(): void {
    if (this._offset < this._tokens.length) {
      this._tokens.splice(this._offset, 1);
    }
  }
}
