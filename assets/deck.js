/* Pure deck operations, shared by the app and the verification script. */
(function(root){
  function shuffle(ids,random=Math.random){const deck=[...ids];for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return {version:1,remaining:deck,discards:[],current:null};}
  function draw(state){if(!state.remaining.length)return state;return {...state,remaining:state.remaining.slice(1),discards:state.current?[...state.discards,state.current]:[...state.discards],current:state.remaining[0]};}
  function valid(state,ids){if(!state||state.version!==1||!Array.isArray(state.remaining)||!Array.isArray(state.discards))return false;const all=[...state.remaining,...state.discards,...(state.current===null?[]:[state.current])];return all.length===ids.length&&new Set(all).size===ids.length&&all.every(id=>ids.includes(id));}
  const api={shuffle,draw,valid};if(typeof module!=='undefined')module.exports=api;else root.TarotDeck=api;
})(globalThis);
