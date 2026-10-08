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

// Old saved decks remain valid and keep their cards upright.
const legacy={version:1,remaining:ids.slice(1),discards:[],current:ids[0]};
assert.ok(deck.valid(legacy,ids));
const legacyDraw=deck.draw(legacy,true,()=>0);
assert.equal(legacyDraw.orientations[ids[1]],true);
assert.equal(legacyDraw.orientations[ids[0]],undefined);
let inverted=deck.shuffle(ids,()=>0.5);const invertedOrder=[...inverted.remaining];
for(let i=0;i<78;i++){
 inverted=deck.draw(inverted,true,()=>i%2===0?0.25:0.75);
 assert.equal(inverted.current,invertedOrder[i]);
 assert.equal(inverted.orientations[inverted.current],i%2===0);
 assert.ok(deck.valid(inverted,ids));
}
assert.equal(Object.keys(inverted.orientations).length,78);
assert.equal(inverted.discards.length,77);
assert.deepEqual(JSON.parse(JSON.stringify(inverted)),inverted);
assert.strictEqual(deck.draw(inverted,true),inverted);
assert.deepEqual(deck.shuffle(ids).orientations,{});
let upright=deck.shuffle(ids);
upright=deck.draw(upright,false,()=>{throw Error('Upright-only draws should not use orientation RNG');});
assert.equal(upright.orientations[upright.current],false);
const boundary=deck.draw(deck.shuffle(ids),true,()=>0.5);
assert.equal(boundary.orientations[boundary.current],false);
assert.equal(deck.valid({...upright,orientations:null},ids),false);
assert.equal(deck.valid({...upright,orientations:[]},ids),false);
assert.equal(deck.valid({...upright,orientations:{[upright.current]:'true'}},ids),false);
assert.equal(deck.valid({...upright,orientations:{[upright.remaining[0]]:true}},ids),false);
cards.forEach(c=>{assert.ok(c.inverted&&Array.isArray(c.inverted.keywords)&&c.inverted.keywords.length);for(const key of ['meaning','reflection','rules'])assert.equal(typeof c.inverted[key],'string');assert.ok(c.inverted.meaning&&c.inverted.reflection);});
console.log('Verified inverted draws, 50% boundary, orientation persistence, legacy saves, invalid states, shuffle reset, and inverted notes for 78 cards.');
