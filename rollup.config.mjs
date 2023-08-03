import typescript from 'rollup-plugin-typescript2'

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
          },
        },
      ],
    external: ['@mdhnpm/color-contrast-ratio-calculator'],
    plugins: [typescript({ useTsconfigDeclarationDir: true })],
}