// scripts/build-widget.js
const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ['app/widget/entry.tsx'],
    bundle: true,
    outfile: 'public/chat-widget.js',
    format: 'iife',
    globalName: 'ChatPage',
    platform: 'browser',
    target: ['es2020'],
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
    define: {
      'process.env.NODE_ENV': '"development"' // Alterar para 'development' para usar a versão não minimizada
    },
  }).then(() => {
    console.log('✅ Widget compilado com sucesso!');
  }).catch(() => process.exit(1));
  