import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve';

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
            '@mdhnpm/color-contrast-ratio-calculator': 'colorContrastRatioCalculator',
            'color-convert': 'convert'
          },
        },
      ],
    external: ['@mdhnpm/color-contrast-ratio-calculator', 'color-convert'],
    plugins: [typescript({ useTsconfigDeclarationDir: true }), nodeResolve()],
}