import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

const errors = [];

// check if there is a syntax error, or if fetchData is used before it is defined, or if there is a problem with the dependencies of useEffect
// Actually, let's just make sure it compiles with tsc
