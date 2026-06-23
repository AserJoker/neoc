import type { TokenStream } from '../../core/TokenStream.js';
import type { NeocTokenType } from '../NeocToken.js';
import type { Statement } from './Statement.js';
import { StatementBlock } from './StatementBlock.js';
import { StatementBreak } from './StatementBreak.js';
import { StatementContinue } from './StatementContinue.js';
import { StatementDeclaration } from './StatementDeclaration.js';
import { StatementDoWhile } from './StatementDoWhile.js';
import { StatementEmpty } from './StatementEmpty.js';
import { StatementEnum } from './StatementEnum.js';
import { StatementExpression } from './StatementExpression.js';
import { StatementFor } from './StatementFor.js';
import { StatementForeach } from './StatementForech.js';
import { StatementFunction } from './StatementFunction.js';
import { StatementIf } from './StatementIf.js';
import { StatementReturn } from './StatementReturn.js';
import { StatementStruct } from './StatementStruct.js';
import { StatementSwitch } from './StatementSwitch.js';
import { StatementWhile } from './StatementWhile.js';

export const readStatement = (stream: TokenStream<NeocTokenType>) => {
  let sts: Statement | undefined = undefined;
  if (!sts) {
    sts = StatementIf.read(stream);
  }
  if (!sts) {
    sts = StatementWhile.read(stream);
  }
  if (!sts) {
    sts = StatementDoWhile.read(stream);
  }
  if (!sts) {
    sts = StatementFor.read(stream);
  }
  if (!sts) {
    sts = StatementForeach.read(stream);
  }
  if (!sts) {
    sts = StatementBreak.read(stream);
  }
  if (!sts) {
    sts = StatementContinue.read(stream);
  }
  if (!sts) {
    sts = StatementSwitch.read(stream);
  }
  if (!sts) {
    sts = StatementBlock.read(stream);
  }
  if (!sts) {
    sts = StatementEmpty.read(stream);
  }
  if (!sts) {
    sts = StatementReturn.read(stream);
  }
  if (!sts) {
    sts = StatementFunction.read(stream);
  }
  if (!sts) {
    sts = StatementStruct.read(stream);
  }
  if (!sts) {
    sts = StatementEnum.read(stream);
  }
  if (!sts) {
    sts = StatementDeclaration.read(stream);
  }
  if (!sts) {
    sts = StatementExpression.read(stream);
  }
  return sts;
};
