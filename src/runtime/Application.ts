import { Cmdline } from './Cmdline.js';
import { Compiler } from './Compiler.js';

export class Application {
  private _cmdline = new Cmdline('neoc', 'v0.1.0');
  private _compiler = new Compiler();
  public constructor() {
    this._cmdline.addCommand(
      'build',
      'compile neoc file to binary',
      [
        {
          name: 'o',
          alias: 'output',
          value: true,
          required: false,
        },
      ],
      (options, args) => this.compile(options, args),
    );
  }
  public run(argv: string[]) {
    this._cmdline.run(argv);
  }
  private compile({ output }: Record<string, string>, args: string[]): void {
    if (!args.length) {
      throw new Error('missing entry file');
    }
    this._compiler.compile(args[0] as string, output);
  }
}
