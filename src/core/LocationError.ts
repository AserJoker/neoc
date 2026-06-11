import type { ILocation } from './ILocation.js';

export class LocationError extends Error {
  private _location: ILocation;
  private _filename: string;
  public constructor(message: string, filename: string, location: ILocation) {
    super(message);
    this._filename = filename;
    this._location = location;
  }
  public getLocation(): ILocation {
    return this._location;
  }
  public getFilename(): string {
    return this._filename;
  }
  public format(): string {
    return this.message;
  }
}
