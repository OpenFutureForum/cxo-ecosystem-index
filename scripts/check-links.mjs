import fs from 'node:fs/promises';
import path from 'node:path';
import {root} from './lib.mjs';
const docs=path.join(root,'docs');
const files=[];
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const target=path.join(dir,entry.name);if(entry.isDirectory())await walk(target);else if(entry.name.endsWith('.html'))files.push(target)}}
await walk(docs);
const errors=[];
for(const file of files){const html=await fs.readFile(file,'utf8');for(const match of html.matchAll(/href="([^"]+)"/g)){const href=match[1];if(/^(https?:|#|mailto:)/.test(href))continue;const clean=href.split(/[?#]/)[0];const target=path.resolve(path.dirname(file),clean);try{await fs.access(target)}catch{errors.push(`${path.relative(docs,file)} -> ${href}`)}}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Checked internal links across ${files.length} HTML pages.`);
