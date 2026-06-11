import { Node } from '../core/Node.js';
import type { TokenStream } from '../core/TokenStream.js';
import { NeocTokenType } from './NeocToken.js';

export enum NeocNodeType {
  ERROR = 'error',
  PROGRAM = 'program',
  DECORATOR = 'decorator',
  LITERAL_NUMERIC = 'literal_numeric',
  LITERAL_STRING = 'literal_string',
  LITERAL_CHAR = 'literal_char',
  LITERAL_SYMBOL = 'literial_symbol',
  LITERAL_IDENTIFIER = 'literal_identifier',
  LITERAL_KEYWORD = 'literal_keyword',
  EXPRESSION_BINARY = 'expression_binary',
  EXPRESSION_MEMBER = 'expression_member',
  EXPRESSION_COMPUTE_MEMBER = 'expression_compute_member',
  EXPRESSION_CALL = 'expression_call',
  EXPRESSION_ASSIGMENT = 'expression_assigment',
  EXPRESSION_CONDITION = 'expression_condition',
  EXPRESSION_COMMA = 'expression_comma',
  EXPRESSION_GROUP = 'expression_group',
  EXPRESSION_SPREAD = 'expression_spread',
  EXPRESSION_SLICE = 'expression_slice',
  DECLARATION_INITIALIZE_LIST = 'declaration_initialize_list',
  INITIALIZE_LIST_FIELD = 'initialize_list_field',
  DECLARATION_ARRAY = 'declaration_array',
  DECLARATION_PTR = 'declaration_ptr',
  DECLARATION_CALLABLE = 'declaration_callable',
  DECLARATION_FUNCTION = 'declaration_function',
  DECLARATION_STRUCT = 'declaration_struct',
  STRUCT_FIELD = 'struct_field',
  DECLARATION_SLICE = 'declaration_slice',
  DECLARATION_ENUM = 'declaration_enum',
  ENUM_ITEM = 'enum_item',
  ARGUMENT = 'argument',
  ARGUMENT_REST = 'argument_rest',
  STATEMENT_EMPTY = 'statement_empty',
  STATEMENT_BLOCK = 'statement_block',
  STATEMENT_FUNCTION = 'statement_function',
  STATEMENT_STRUCT = 'statement_struct',
  STATEMENT_ENUM = 'statement_enum',
  STATEMENT_DECLARATION = 'statement_declaration',
  VARIABLE_DECLARATOR = 'variable_declarator',
  STATEMENT_EXPRESSION = 'statement_expression',
  STATEMENT_IF = 'statement_if',
  STATEMENT_SWITCH = 'statement_switch',
  SWITCH_MATCH = 'statement_match',
  STATEMENT_WHILE = 'statement_while',
  STATEMENT_DO_WHILE = 'statement_do_while',
  STATEMENT_FOR = 'statement_for',
  STATEMENT_FOREACH = 'statement_foreach',
  STATEMENT_DEFER = 'statement_defer',
  STATEMENT_BREAK = 'statement_break',
  STATEMENT_CONTINUE = 'statement_continue',
  STATEMENT_RETURN = 'statement_return',
  STATEMENT_TEST = 'statement_test',
  STATEMENT_IMPORT = 'statement_import',
}
export class NeocNode extends Node<NeocNodeType, NeocTokenType> {
  protected static skipSpace(stream: TokenStream<NeocTokenType>): void {
    while (
      stream.read().getType() == NeocTokenType.SPACE ||
      stream.read().getType() == NeocTokenType.COMMENT
    ) {
      stream.eat();
    }
  }
}
