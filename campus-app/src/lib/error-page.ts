export function renderErrorPage(): string {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Something went wrong</title></head>
  <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
    <div style="text-align: center;">
      <h1>Something went wrong</h1>
      <p>Please try refreshing the page.</p>
      <a href="/">Go home</a>
    </div>
  </body>
</html>`;
}
