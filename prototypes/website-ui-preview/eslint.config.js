import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-demo/**', 'node_modules/**'] },
  ...tseslint.configs.recommended,
);
