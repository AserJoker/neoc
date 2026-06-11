interface IOption {
  name: string;
  alias: string;
  required: boolean;
  value: boolean;
}
interface ICommand {
  name: string;
  description: string;
  options: IOption[];
  run: (options: Record<string, string>, args: string[]) => void;
}
export class Cmdline {
  private _commands: Record<string, ICommand> = {};
  private _name: string = '';
  private _version: string = '';
  private help() {
    console.log(`${this._name} <subcommand> <options> ...`);
    console.log(`version ${this._version}`);
    console.log('commands:');
    for (const name in this._commands) {
      const cmd = this._commands[name];
      if (cmd) {
        console.log(`  ${cmd.name} ${cmd.description}`);
      }
    }
  }

  public constructor(name: string, version: string) {
    this._name = name;
    this._version = version;
    this.addCommand('help', 'show help', [], (_options, _args) => this.help());
  }
  public addCommand(
    name: string,
    description: string,
    options: IOption[],
    run: (options: Record<string, string>, args: string[]) => void,
  ): void {
    this._commands[name] = {
      name,
      description,
      options,
      run,
    };
  }
  public run(argv: string[]) {
    if (argv.length < 3) {
      return this.help();
    }
    const name = argv[2] as string;
    const cmd = this._commands[name];
    if (!cmd) {
      console.log(`unknown command ${name}`);
      return this.help();
    }
    const record: Record<string, string> = {};
    const args: string[] = [];
    let idx = 3;
    while (idx < argv.length) {
      const arg = argv[idx] as string;
      if (arg.startsWith('-')) {
        let opt: IOption | undefined = undefined;
        if (arg.startsWith('--')) {
          opt = cmd.options.find((opt) => opt.alias == arg.substring(2));
        } else {
          opt = cmd.options.find((opt) => opt.name == arg.substring(1));
        }
        if (!opt) {
          throw new Error(`unknown option: ${arg}`);
        }
        if (opt.value) {
          idx++;
          if (idx < argv.length) {
            throw new Error(`argument ${arg} required value`);
          }
          record[opt.name] = argv[idx] as string;
        } else {
          record[opt.name] = 'true';
        }
      } else {
        args.push(arg);
      }
      idx++;
    }
    for (const opt of cmd.options) {
      if (opt.required && !record[opt.name]) {
        throw new Error(`option ${opt.name} is required`);
      }
    }
    cmd.run(record, args);
  }
}
