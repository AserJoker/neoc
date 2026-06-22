import type { TokenStream } from '../core/TokenStream.js';
import { DeclarationArray } from './DeclarationArray.js';
import { DeclarationCallable } from './DeclarationCallable.js';
import { DeclarationEnum } from './DeclarationEnum.js';
import { DeclarationFunction } from './DeclarationFunction.js';
import { DeclarationInitializeList } from './DeclarationInitializeLIst.js';
import { DeclarationPtr } from './DeclarationPtr.js';
import { DeclarationSlice } from './DeclarationSlice.js';
import { DeclarationStruct } from './DeclarationStruct.js';
import { Expression } from './Expression.js';
import { ExpressionGroup } from './ExpressionGroup.js';
import { ExpressionMember } from './ExpressionMember.js';
import { LiteralIdentifier } from './LiteralIdentifier.js';
import { LiteralString } from './LiteralString.js';
import { LiteralNumeric } from './LitreralNumeric.js';
import type { NeocTokenType } from './NeocToken.js';

export class ExpressionValue extends Expression {
  public static read(
    stream: TokenStream<NeocTokenType>,
  ): Expression | undefined {
    let expr: Expression | undefined = LiteralString.read(stream);
    if (!expr) {
      expr = LiteralNumeric.read(stream);
    }
    if (!expr) {
      expr = LiteralNumeric.read(stream);
    }
    if (!expr) {
      expr = LiteralIdentifier.read(stream);
    }
    if (!expr) {
      expr = ExpressionGroup.read(stream);
    }
    if (!expr) {
      expr = DeclarationPtr.read(stream);
    }
    if (!expr) {
      expr = DeclarationSlice.read(stream);
    }
    if (!expr) {
      expr = DeclarationArray.read(stream);
    }
    if (!expr) {
      expr = DeclarationCallable.read(stream);
    }
    if (!expr) {
      expr = DeclarationFunction.read(stream);
    }
    if (!expr) {
      expr = DeclarationStruct.read(stream);
    }
    if (!expr) {
      expr = DeclarationEnum.read(stream);
    }
    if (!expr) {
      expr = DeclarationInitializeList.read(stream);
    }
    if (!expr) {
      expr = ExpressionMember.read(undefined, stream);
    }
    return expr;
  }
}
