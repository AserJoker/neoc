import type { IPosition } from './IPoistion.js';

export class PositionError extends Error {
  private _position: IPosition;
  private _filename: string;
  public constructor(message: string, filename: string, position: IPosition) {
    super(message);
    this._position = position;
    this._filename = filename;
  }
  public getPosition() {
    return this._position;
  }
  public format(): string {
    return `Failed to compile ${this._filename}:${this._position.line + 1}:${this._position.column + 1}: ${this.message}`;
  }
}
