'use strict';
// Verify behavior, not timing, on an immutable archived source snapshot.
const SOURCE_BLOB = '8439bd24136056784ef0f89e3bb5f98dd7db418b';
const SIZES = [200, 600, 1000, 1500];
const MODES = ['flow', 'lane', 'nearestLane', 'density', 'caff'];
const MAPS = ['dual', 'single', 'triple', 'open', 'reverse'];
function load(html) {
  const core = html.split('<script>')[1].split('</script>')[0];
  const archive = JSON.parse(html.split('const OFFLINE=')[1].split(';</script>')[0]);
  const mod = {exports:{}};
  new Function('module','performance',core)(mod,{now:()=>Date.now()});
  return {C:mod.exports, archive};
}
function replay(C, rows, horizon) {
  let matched=0;
  const failures=[];
  for (const row of rows) {
    const {scenario,n,seed,mode}=row;
    try {
      const actual=C.run({scenario,n,seed,mode,verify:true},horizon);
      const keys=Object.keys(row).filter(k=>!['planningMs','stepMs','suite'].includes(k));
      const differences=keys.filter(k=>JSON.stringify(row[k])!==JSON.stringify(actual[k]));
      if(differences.length) failures.push({scenario,n,seed,mode,differences:differences.map(k=>({key:k,expected:row[k],actual:actual[k]}))});
      else matched++;
    } catch (error) { failures.push({scenario,n,seed,mode,error:String(error)}); }
  }
  return {total:rows.length,matched,failures};
}
function validateHeldout(data,n) {
  if(data.sourceBlob!==SOURCE_BLOB || data.horizon!==800 || data.verify!==true || !data.timingExcluded || data.errors.length || data.rows.length!==500) throw Error('Unexpected held-out metadata');
  const expected=new Set();
  for(const scenario of MAPS) for(let seed=1001;seed<=1020;seed++) for(const mode of MODES) expected.add([scenario,n,seed,mode].join('/'));
  for(const r of data.rows) if(!expected.delete([r.scenario,r.n,r.seed,r.mode].join('/'))) throw Error('Unexpected or duplicate held-out row');
  if(expected.size) throw Error('Missing held-out rows');
}
module.exports={load,replay,validateHeldout};
if (require.main===module) {
  const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
  const raw=fs.readFileSync(path.join(__dirname,'../../CAFF_Lab(1).html'));
  const hash=crypto.createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex');
  if(hash!==SOURCE_BLOB) throw Error('Archived source blob mismatch: '+hash);
  const {C,archive}=load(raw.toString('utf8'));
  if(archive.results.length!==325) throw Error('Unexpected archive size');
  const reports=[{suite:'archive',...replay(C,archive.results,archive.metadata.horizon)}];
  if(process.argv.includes('--heldout')) for(const n of SIZES) {
    const data=JSON.parse(fs.readFileSync(path.join(__dirname,'heldout-'+n+'.json'),'utf8'));
    validateHeldout(data,n);
    reports.push({suite:'heldout-'+n,...replay(C,data.rows,data.horizon)});
  }
  console.log(JSON.stringify(reports,null,2));
  if(reports.some(r=>r.failures.length)) process.exitCode=1;
}
