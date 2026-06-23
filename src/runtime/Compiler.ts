import fs from 'fs';
import path from 'path';
import { SourceStream } from '../core/SourceStream.js';
import { NeocToken, NeocTokenType } from '../neoc/NeocToken.js';
import { PositionError } from '../core/PositionError.js';
import { type Token } from '../core/Token.js';
import { TokenStream } from '../core/TokenStream.js';
import { Program } from '../neoc/node/Program.js';
export class Compiler {
  private readToken(stream: SourceStream): Token<NeocTokenType> | undefined {
    let token = NeocToken.readStringToken(stream);
    if (!token) {
      token = NeocToken.readCommentToken(stream);
    }
    if (!token) {
      token = NeocToken.readSymbolToken(stream);
    }
    if (!token) {
      token = NeocToken.readEofToken(stream);
    }
    if (!token) {
      token = NeocToken.readSpaceToken(stream);
    }
    if (!token) {
      token = NeocToken.readLiteralToken(stream);
    }
    if (!token) {
      token = NeocToken.readNumberToken(stream);
    }
    return token;
  }
  private resolveTokens(stream: SourceStream) {
    const tokens: Token<NeocTokenType>[] = [];
    while (true) {
      const token = this.readToken(stream);
      if (!token) {
        throw new PositionError(
          'Unexpected token',
          stream.getFilename(),
          stream.getPosition(),
        );
      }
      tokens.push(token);
      if (token.getType() == NeocTokenType.EOF) {
        break;
      }
    }
    return tokens;
  }

  private compileFile(filename: string, source: string) {
    try {
      const stream = new SourceStream(filename, Buffer.from(source, 'utf-8'));
      const tokens = this.resolveTokens(stream);
      const tokenStream = new TokenStream(tokens, stream);
      const program = Program.read(tokenStream);
      console.log(JSON.stringify(program.serialize(), null, 2));
    } catch (e) {
      if (e instanceof PositionError) {
        throw new Error(e.format());
      } else {
        throw e;
      }
    }
  }
  public compile(entry: string, output?: string) {
    if (!fs.existsSync(entry)) {
      throw new Error(`${entry} is not exists`);
    }
    entry = path.resolve(process.cwd(), entry);
    const dirname = path.dirname(entry);
    const buildDirname = path.join(dirname, 'build');
    if (!fs.existsSync(buildDirname)) {
      fs.mkdirSync(buildDirname);
    }
    if (!fs.statSync(buildDirname).isDirectory()) {
      throw new Error(`${buildDirname} is not directory`);
    }
    if (!output) {
      output = path.join(dirname, 'a.out');
    }
    if (fs.statSync(entry).isFile()) {
      const source = fs.readFileSync(entry, { encoding: 'utf-8' });
      this.compileFile(entry, source);
    } else {
      throw new Error(`${entry} is not a file`);
    }
  }
}
