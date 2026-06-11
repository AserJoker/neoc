import type { ILocation } from './ILocation.js';
import type { SourceStream } from './SourceStream.js';

export class Token<TokenType> {
  private _location: ILocation;
  private _type: TokenType;
  private _stream: SourceStream;
  protected constructor(
    stream: SourceStream,
    location: ILocation,
    type: TokenType,
  ) {
    this._stream = stream;
    this._location = location;
    this._type = type;
  }
  public getLocation(): ILocation {
    return this._location;
  }
  public getType(): TokenType {
    return this._type;
  }
  public getText(): string {
    return this._stream.getText(this._location);
  }
  public toString(): string {
    return `|${this._type}|${this.getText().replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll('\r', '\\r')}|[${this._location.begin.offset}, ${this._location.end.offset}]`;
  }
}
