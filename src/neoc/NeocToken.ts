import { PositionError } from '../core/PositionError.js';
import type { SourceStream } from '../core/SourceStream.js';
import { Token } from '../core/Token.js';

export enum NeocTokenType {
  KEYWORD = 'keyword',
  NUMERIC = 'numeric',
  STRING = 'string',
  CHARACTOR = 'charactor',
  IDENTIFIER = 'identifier',
  SYMBOL = 'symbol',
  SPACE = 'space',
  COMMENT = 'common',
  EOF = 'eof',
}
export class NeocToken extends Token<NeocTokenType> {
  public static readStringToken(
    stream: SourceStream,
  ): Token<NeocTokenType> | undefined {
    if (stream.read() != '\"') {
      return undefined;
    }
    const begin = stream.getPosition();
    stream.eat();
    while (true) {
      const chr = stream.read();
      if (chr == '\\') {
        stream.eat();
      } else if (chr == '\n') {
        throw new PositionError(
          "Unexpected token, missing '\"' for string",
          stream.getFilename(),
          stream.getPosition(),
        );
      } else if (chr == '\"') {
        stream.eat();
        break;
      }
      stream.eat();
    }
    const end = stream.getPosition();
    return new Token(stream, { begin, end }, NeocTokenType.STRING);
  }
  private static symbols = [
    '[*]',
    '...',
    '>>=',
    '<<=',
    '>>',
    '<<',
    '&&',
    '||',
    '??',
    '==',
    '!=',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
    '^=',
    '&=',
    '|=',
    '~=',
    '>=',
    '<=',
    '->',
    '[[',
    ']]',
    '=',
    '+',
    '-',
    '*',
    '/',
    '%',
    '&',
    '|',
    '~',
    '^',
    '!',
    ':',
    ';',
    ',',
    '(',
    ')',
    '{',
    '}',
    '[',
    ']',
    '<',
    '>',
    '.',
  ];

  public static readSymbolToken(
    stream: SourceStream,
  ): Token<NeocTokenType> | undefined {
    for (const symbol of this.symbols) {
      const begin = stream.getPosition();
      for (const chr of symbol) {
        if (chr != stream.read()) {
          stream.setPosition(begin);
          break;
        }
        stream.eat();
      }
      const end = stream.getPosition();
      if (end.offset != begin.offset) {
        return new Token(stream, { begin, end }, NeocTokenType.SYMBOL);
      }
    }
    return undefined;
  }
  public static readEofToken(
    stream: SourceStream,
  ): Token<NeocTokenType> | undefined {
    if (stream.eof()) {
      return new Token(
        stream,
        { begin: stream.getPosition(), end: stream.getPosition() },
        NeocTokenType.EOF,
      );
    }
    return undefined;
  }
  public static readCommentToken(
    stream: SourceStream,
  ): Token<NeocTokenType> | undefined {
    const begin = stream.getPosition();
    if (stream.read() == '/' && stream.read(1) == '/') {
      stream.eat();
      stream.eat();
      while (true) {
        if (stream.eof()) {
          break;
        }
        if (
          stream.read() == '\n' ||
          stream.read() == '\r' ||
          stream.read() == String.fromCodePoint(0x2028) ||
          stream.read() == String.fromCodePoint(0x2029)
        ) {
          break;
        }
        stream.eat();
      }
      const end = stream.getPosition();
      return new Token<NeocTokenType>(
        stream,
        { begin, end },
        NeocTokenType.COMMENT,
      );
    } else if (stream.read() == '/' && stream.read(1) == '*') {
      stream.eat();
      stream.eat();
      while (true) {
        if (stream.eof()) {
          throw new PositionError(
            "missing '*/' for comment",
            stream.getFilename(),
            stream.getPosition(),
          );
        }
        if (stream.read() == '\\') {
          stream.eat();
          if (stream.eof()) {
            throw new PositionError(
              "missing '*/' for comment",
              stream.getFilename(),
              stream.getPosition(),
            );
          }
        } else if (stream.read() == '*' && stream.read(1) == '/') {
          stream.eat();
          stream.eat();
          break;
        }
        stream.eat();
      }
      const end = stream.getPosition();
      return new Token<NeocTokenType>(
        stream,
        { begin, end },
        NeocTokenType.COMMENT,
      );
    }
    stream.setPosition(begin);
    return undefined;
  }
  public static readSpaceToken(
    stream: SourceStream,
  ): Token<NeocTokenType> | undefined {
    const begin = stream.getPosition();
    const chr = stream.read();
    if (
      chr == ' ' ||
      chr == '\t' ||
      chr == '\n' ||
      chr == '\r' ||
      chr.codePointAt(0) === 0x2028 ||
      chr.charCodeAt(0) == 0x2029
    ) {
      stream.eat();
      while (true) {
        const chr = stream.read();
        if (
          chr == ' ' ||
          chr == '\t' ||
          chr == '\n' ||
          chr == '\r' ||
          chr.codePointAt(0) === 0x2028 ||
          chr.charCodeAt(0) == 0x2029
        ) {
          stream.eat();
        } else {
          break;
        }
      }
      const end = stream.getPosition();
      return new Token(stream, { begin, end }, NeocTokenType.SPACE);
    } else {
      return undefined;
    }
  }
  static keywords = [
    'defer',
    'func',
    'struct',
    'enum',
    'union',
    'if',
    'import',
    'pub',
    'else',
    'while',
    'for',
    'foreach',
    'break',
    'continue',
    'return',
    'switch',
    'case',
    'default',
    'do',
    'comptime',
    'export',
    'extern',
    'defer',
    'inline',
    'test',
    'register',
    'const',
    'let',
    'mutable',
    'volatile',
    'in',
    'of',
    'typeof',
    'sizeof',
    'alignof',
  ];
  public static readLiteralToken(stream: SourceStream) {
    const begin = stream.getPosition();
    const chr = stream.read();
    if (!/^[\p{ID_Start}$_]$/u.test(chr) || chr == '_') {
      return undefined;
    }
    stream.eat();
    while (true) {
      if (stream.eof()) {
        break;
      }
      const chr = stream.read();
      if (!/^[\p{ID_Continue}$_]$/u.test(chr) || chr == '_') {
        break;
      }
      stream.eat();
    }
    const end = stream.getPosition();
    const text = stream.getText({ begin, end });
    if (this.keywords.includes(text)) {
      return new NeocToken(stream, { begin, end }, NeocTokenType.KEYWORD);
    }
    return new NeocToken(stream, { begin, end }, NeocTokenType.IDENTIFIER);
  }
  public static readNumberToken(stream: SourceStream) {
    const begin = stream.getPosition();
    if (
      stream.read() == '0' &&
      (stream.read(1) == 'x' || stream.read(1) == 'X')
    ) {
      stream.eat();
      stream.eat();
      while (true) {
        const chr = stream.read();
        if (
          (chr >= '0' && chr <= '9') ||
          (chr >= 'a' && chr <= 'f') ||
          (chr >= 'A' && chr <= 'F')
        ) {
          stream.eat();
        } else {
          break;
        }
      }
      const end = stream.getPosition();
      return new NeocToken(stream, { begin, end }, NeocTokenType.NUMERIC);
    } else if (
      stream.read() == '0' &&
      (stream.read(1) == 'o' || stream.read(1) == 'O')
    ) {
      stream.eat();
      stream.eat();
      while (true) {
        const chr = stream.read();
        if (chr >= '0' && chr <= '7') {
          stream.eat();
        } else {
          break;
        }
      }
      const end = stream.getPosition();
      return new NeocToken(stream, { begin, end }, NeocTokenType.NUMERIC);
    } else if (
      stream.read() == '0' &&
      (stream.read(1) == 'b' || stream.read(1) == 'B')
    ) {
      stream.eat();
      stream.eat();
      while (true) {
        const chr = stream.read();
        if (chr >= '0' && chr <= '1') {
          stream.eat();
        } else {
          break;
        }
      }
      const end = stream.getPosition();
      return new NeocToken(stream, { begin, end }, NeocTokenType.NUMERIC);
    } else if (
      (stream.read() >= '0' && stream.read() <= '9') ||
      (stream.read() == '.' && stream.read(1) >= '0' && stream.read(1) <= '9')
    ) {
      while (true) {
        const chr = stream.read();
        if (chr >= '0' && chr <= '9') {
          stream.eat();
        } else {
          break;
        }
      }
      if (stream.read() == '.') {
        stream.eat();
        while (true) {
          const chr = stream.read();
          if (chr >= '0' && chr <= '9') {
            stream.eat();
          } else {
            break;
          }
        }
      }
      if (stream.read() == 'e' || stream.read() == 'E') {
        stream.read();
        while (true) {
          const chr = stream.read();
          if (chr >= '0' && chr <= '9') {
            stream.eat();
          } else {
            break;
          }
        }
      }
      const end = stream.getPosition();
      return new NeocToken(stream, { begin, end }, NeocTokenType.NUMERIC);
    }
    return undefined;
  }
}
