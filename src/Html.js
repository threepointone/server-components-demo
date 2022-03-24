export default function Html() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link
          rel="shortcut icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕹</text></svg>"
        />
        <meta name="description" content="React with Server Components demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/style.css" />
        <title>React Notes</title>
      </head>
      <body>
        <div id="root"></div>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<b>Enable JavaScript to run this app.</b>`,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
            global = window;
      
            const __esbuild__module_map__ = new Map();
      
            // we just use webpack's function names to avoid forking react
            const ROOT = "http://localhost:8787/"
            global.__webpack_chunk_load__ = async function(moduleId) {
              const mod = await import(moduleId.replace('./src', '//' + window.location.host));
              __esbuild__module_map__.set(moduleId, mod);
              return mod;
            };
      
            global.__webpack_require__ = function(moduleId) {
              return __esbuild__module_map__.get(moduleId);
            };
            // In development, we restart the server on every edit.
            // For the purposes of this demo, retry fetch automatically.
            let nativeFetch = window.fetch;
            window.fetch = async function fetchWithRetry(...args) {
              for (let i = 0; i < 4; i++) {
                try {
                  return await nativeFetch(...args);
                } catch (e) {
                  if (args[1] && args[1].method !== 'GET') {
                    // Don't retry mutations to avoid confusion
                    throw e;
                  }
                  await new Promise((resolve) => setTimeout(resolve, 500));
                }
              }
              return nativeFetch(...args);
            };
            `,
          }}
        />
        <script src="/index.client.js" type="module" />
      </body>
    </html>
  );
}
