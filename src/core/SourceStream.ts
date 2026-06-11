import type { ILocation } from './ILocation.js';
import type { IPosition } from './IPoistion.js';
import { PositionError } from './PositionError.js';

export class SourceStream {
  private _source: Buffer;
  private _filename: string;
  private _position: IPosition = {
    offset: 0,
    column: 0,
    line: 0,
  };
  public constructor(filename: string, source: Buffer) {
    this._filename = filename;
    this._source = source;
  }
  public getSoruce(): Buffer {
    return this._source;
  }
  public getFilename(): string {
    return this._filename;
  }
  public getText(location: ILocation): string {
    return this._source
      .subarray(location.begin.offset, location.end.offset)
      .toString('utf-8');
  }
  public getPosition(): IPosition {
    return { ...this._position };
  }
  public setPosition(position: IPosition) {
    this._position = {
      ...position,
    };
  }
  private readCharCode(off = 0) {
    const offset = this._position.offset + off;
    if (offset >= this._source.length) {
      return { code: 0, len: 0 };
    }
    const buffer = this._source;
    const firstByte = buffer[offset] as number;
    if ((firstByte & 0x80) === 0) {
      return { code: firstByte, len: 1 };
    } else if ((firstByte & 0xe0) === 0xc0) {
      const secondByte = buffer[offset + 1] as number;
      return { code: ((firstByte & 0x1f) << 6) | (secondByte & 0x3f), len: 2 };
    } else if ((firstByte & 0xf0) === 0xe0) {
      const secondByte = buffer[offset + 1] as number;
      const thirdByte = buffer[offset + 2] as number;
      return {
        code:
          ((firstByte & 0x0f) << 12) |
          ((secondByte & 0x3f) << 6) |
          (thirdByte & 0x3f),
        len: 3,
      };
    } else if ((firstByte & 0xf8) === 0xf0) {
      const secondByte = buffer[offset + 1] as number;
      const thirdByte = buffer[offset + 2] as number;
      const fourthByte = buffer[offset + 3] as number;
      return {
        code:
          ((firstByte & 0x07) << 18) |
          ((secondByte & 0x3f) << 12) |
          ((thirdByte & 0x3f) << 6) |
          (fourthByte & 0x3f),
        len: 4,
      };
    }
    throw new PositionError(
      'Invalid UTF-8 sequence',
      this._filename,
      this._position,
    );
  }
  public read(off = 0): string {
    const offset = this._position.offset + off;
    if (offset >= this._source.length) {
      return '';
    }
    const { code } = this.readCharCode(off);
    if (
      code === '\n'.charCodeAt(0) &&
      this.readCharCode(off + 1).code == '\r'.charCodeAt(0)
    ) {
      return '\n';
    }
    if (
      code === '\r'.charCodeAt(0) &&
      this.readCharCode(off + 1).code == '\n'.charCodeAt(0)
    ) {
      return '\n';
    }
    return String.fromCodePoint(code);
  }
  public eat(): void {
    const { code, len } = this.readCharCode(0);
    if (
      code === '\n'.charCodeAt(0) &&
      this.readCharCode(1).code == '\r'.charCodeAt(0)
    ) {
      this._position.offset += 2;
      this._position.column = 0;
      this._position.line++;
      return;
    }
    if (
      code === '\r'.charCodeAt(0) &&
      this.readCharCode(1).code == '\n'.charCodeAt(0)
    ) {
      this._position.offset += 2;
      this._position.column = 0;
      this._position.line++;
      return;
    }
    if (
      code == 0x2028 ||
      code == 0x2029 ||
      code == '\n'.charCodeAt(0) ||
      code == '\r'.charCodeAt(0)
    ) {
      this._position.offset += len;
      this._position.column = 0;
      this._position.line++;
      return;
    }
    this._position.offset += len;
    this._position.column++;
  }
  public eof(): boolean {
    return this._position.offset >= this._source.length;
  }
}
