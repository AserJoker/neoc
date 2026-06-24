import { Node } from '../../core/Node.js';
import type { TokenStream } from '../../core/TokenStream.js';
import { NeocTokenType } from '../NeocToken.js';

export enum NeocNodeType {
  CALLABLE_ARGUMENT = 'callable_argument',
  DECLARATION_ARRAY = 'declaration_array',
  DECLARATION_CALLABLE = 'declaration_callable',
  DECLARATION_CONST = 'declaration_const',
  DECLARATION_ENUM = 'declaration_enum',
  DECLARATION_FUNCTION = 'declaration_function',
  DECLARATION_INITIALIZE_LIST = 'declaration_initialize_list',
  DECLARATION_PTR = 'declaration_ptr',
  DECLARATION_SLICE = 'declaration_slice',
  DECLARATION_STRUCT = 'declaration_struct',
  DECLARATION_TUPLE = 'declaration_tuple',
  DECORATOR = 'decorator',
  ENUM_ITEM = 'enum_item',
  EXPRESSION_ASSIGMENT = 'expression_assigment',
  EXPRESSION_BINARY = 'expression_binary',
  EXPRESSION_CALL = 'expression_call',
  EXPRESSION_COMMA = 'expression_comma',
  EXPRESSION_COMPUTE_MEMBER = 'expression_compute_member',
  EXPRESSION_CONDITION = 'expression_condition',
  EXPRESSION_GROUP = 'expression_group',
  EXPRESSION_MEMBER = 'expression_member',
  EXPRESSION_SLICE = 'expression_slice',
  FUNCTION_ARGUMENT = 'function_argument',
  FUNCTION_BINDING = 'function_binding',
  INITIALIZE_LIST_FIELD = 'initialize_list_field',
  LITERAL_CHAR = 'literal_char',
  LITERAL_IDENTIFIER = 'literal_identifier',
  LITERAL_KEYWORD = 'literal_keyword',
  LITERAL_NUMERIC = 'literal_numeric',
  LITERAL_STRING = 'literal_string',
  LITERAL_SYMBOL = 'literal_symbol',
  PROGRAM = 'program',
  SPREAD = 'spread',
  STATEMENT_BLOCK = 'statement_block',
  STATEMENT_BREAK = 'statement_break',
  STATEMENT_CONTINUE = 'statement_continue',
  STATEMENT_DECLARATION = 'statement_declaration',
  STATEMENT_DEFER = 'statement_defer',
  STATEMENT_DO_WHILE = 'statement_do_while',
  STATEMENT_EMPTY = 'statement_empty',
  STATEMENT_ENUM = 'statement_enum',
  STATEMENT_EXPRESSION = 'statement_expression',
  STATEMENT_FOR = 'statement_for',
  STATEMENT_FOREACH = 'statement_foreach',
  STATEMENT_FUNCTION = 'statement_function',
  STATEMENT_IF = 'statement_if',
  STATEMENT_IMPORT = 'statement_import',
  STATEMENT_RETURN = 'statement_return',
  STATEMENT_STRUCT = 'statement_struct',
  STATEMENT_SWITCH = 'statement_switch',
  STATEMENT_TEST = 'statement_test',
  STATEMENT_WHILE = 'statement_while',
  STRUCT_FIELD = 'struct_field',
  SWITCH_MATCH = 'switch_match',
  VARIABLE_DECLARATOR = 'variable_declarator',
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
