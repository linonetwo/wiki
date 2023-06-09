// pure nodejs context
console.log(`## Hi!`);
let aaa = 3;

/** tw */

// now in worker_thread with $tw wiki access

let filterExample = $tw.wiki.filterOperators.sum((callback) => {callback({}, String(aaa));callback({}, String(aaa))})
console.log(filterExample)

// use Sqlite
const db = $tw.utils.Sqlite
const stmt = db.prepare('SELECT title, text FROM tiddlers');
const result = stmt.pluck().all()
console.log(result)