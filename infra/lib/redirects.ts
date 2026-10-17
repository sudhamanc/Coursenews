/**
 * Turns public/_redirects (Netlify syntax, first match wins) into the
 * CloudFront Function that runs on every page request:
 *
 *   1. The legacy /courses/* → /sections/* 301s, in file order. A rule ending
 *      in `/*` matches everything under that prefix and substitutes `:splat`.
 *   2. Directory URLs → their index.html (/latest and /latest/ both serve
 *      /latest/index.html), which S3 does not do on its own.
 *
 * CloudFront Functions are capped at 10 KB of code, so the table is compact.
 */
import { readFileSync } from 'node:fs';

/** [from, to, isSplat] */
type Rule = [string, string, 0 | 1];

export function parseRedirects(path: string): Rule[] {
  const rules: Rule[] = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [from, to, status] = t.split(/\s+/);
    if (status !== '301' || !from || !to) throw new Error(`Unsupported redirect: ${t}`);
    rules.push(from.endsWith('/*') ? [from.slice(0, -1), to, 1] : [from.replace(/\/$/, ''), to, 0]);
  }
  return rules;
}

export function viewerRequestCode(rules: Rule[]): string {
  const code = `var R=${JSON.stringify(rules)};
function handler(event){
  var req=event.request, uri=req.uri;
  var bare=uri.length>1&&uri.endsWith('/')?uri.slice(0,-1):uri;
  for(var i=0;i<R.length;i++){
    var r=R[i], loc=null;
    if(r[2]){ if(uri.startsWith(r[0])) loc=r[1].replace(':splat',uri.slice(r[0].length)); }
    else if(bare===r[0]) loc=r[1];
    if(loc!==null) return {statusCode:301,statusDescription:'Moved Permanently',headers:{location:{value:loc}}};
  }
  if(uri.endsWith('/')) req.uri=uri+'index.html';
  else if(uri.lastIndexOf('.')<uri.lastIndexOf('/')) req.uri=uri+'/index.html';
  return req;
}`;
  if (code.length > 10_000) throw new Error(`CloudFront Function is ${code.length} bytes (limit 10 KB).`);
  return code;
}
