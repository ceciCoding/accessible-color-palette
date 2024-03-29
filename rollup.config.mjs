import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/index.ts', 
    output: [
        {
          file: 'dist/bundle.cjs.js',
          format: 'cjs',
        },
        {
          file: 'dist/bundle.esm.js',
          format: 'esm',
        },
        {
          file: 'dist/bundle.iife.js',
          format: 'iife',
          name: 'AccessibleColorPalette',  
          globals: {
            'color-convert': 'convert'
          },
        },
      ],
    external: ['color-convert'],
    plugins: [
      typescript({ useTsconfigDeclarationDir: true }),
      nodeResolve(),
      commonjs({
        include: 'node_modules/**'
      })
    ],
}