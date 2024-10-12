pnpm create plasmo --with-supabase

tailwind
pnpm i -D tailwindcss postcss autoprefixer
npx tailwindcss init

postcss.config.js

```
/**
 * @type {import('postcss').ProcessOptions}
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```
