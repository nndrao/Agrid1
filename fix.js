const fs = require('fs'); const content = fs.readFileSync('src/store/gridStore.ts', 'utf8'); const fixed = content.replace(/colError
\)/g, 'colError);'); fs.writeFileSync('src/store/gridStore.ts', fixed);
