import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';

// Vite picks this up automatically for all CSS it processes.
// Browser targets come from the "browserslist" field in package.json.
export default {
  plugins: [
    postcssPresetEnv({
      stage: 2,
      features: {
        // Native CSS nesting (`& .child { ... }`).
        'nesting-rules': true,
      },
    }),
    autoprefixer(),
  ],
};
