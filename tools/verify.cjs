const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const deck=require('../assets/deck.js');
const root=path.resolve(__dirname,'..');
const cards=JSON.parse(fs.readFileSync(path.join(root,'assets/cards.json'),'utf8'));
const ids=cards.map(c=>c.id);
assert.equal(ids.length,78);assert.equal(new Set(ids).size,78);
cards.forEach(c=>assert.ok(fs.existsSync(path.join(root,c.image)),c.image));
let state=deck.shuffle(ids,()=>0.5);assert.ok(deck.valid(state,ids));assert.notDeepEqual(state.remaining,ids);
const order=[...state.remaining];
for(let i=0;i<78;i++){state=deck.draw(state);assert.equal(state.current,order[i]);assert.equal(state.remaining.length,77-i);assert.equal(state.discards.length,i);assert.ok(deck.valid(state,ids));assert.deepEqual(JSON.parse(JSON.stringify(state)),state);}
assert.strictEqual(deck.draw(state),state);
assert.equal(deck.valid({...state,current:'unknown'},ids),false);
assert.equal(deck.valid({...state,discards:[...state.discards,state.current]},ids),false);
state=deck.shuffle(ids);assert.equal(state.current,null);assert.equal(state.discards.length,0);assert.equal(state.remaining.length,78);
console.log('Verified 78 card assets, unique draws, exhaustion, saved-state integrity, and shuffle reset.');
