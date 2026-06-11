import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

export default [
  // 忽略 node_modules 和构建产物
  {
    ignores: ['node_modules/', 'dist/', 'build/', '*.min.js'],
  },
  
  // TypeScript 文件通用配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // 如果项目中有全局变量（如 window, document），可以在这里声明
        // console: false,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin, // 注意：eslint-plugin-prettier v4+ 使用 default 导出
    },
    rules: {
      // --- TypeScript 特定规则 ---
      // 禁止使用 any 类型，除非必要
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // 禁止多余的 non-null 断言 (!)
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // 推荐在接口和类型中使用 PascalCase
      '@typescript-eslint/interface-name-prefix': 'off', // 现代 TS 不强制要求前缀 I
      
      // 禁止未使用的变量（包括导入）
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      
      // 推荐显式返回类型（可选，严格模式下开启）
      // '@typescript-eslint/explicit-function-return-type': 'warn',

      // --- JavaScript/通用规则 ---
      // 禁用 JS 原生规则中与 TS 冲突的部分
      'no-unused-vars': 'off',
      
      // 分号强制
      semi: ['error', 'always'],
      
      // 对象属性键不使用引号如果可能
      'quote-props': ['error', 'as-needed'],
    },
  },

  // JavaScript 文件配置（如果有混合项目）
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
];
