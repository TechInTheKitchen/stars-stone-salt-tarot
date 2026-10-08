/* Pure deck operations, shared by the app and the verification script. */
(function(root){
  function shuffle(ids,random=Math.random){const deck=[...ids];for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return {version:1,remaining:deck,discards:[],current:null,orientations:{}};}
  function draw(state,allowInverted=false,random=Math.random){if(!state.remaining.length)return state;const next=state.remaining[0];return {...state,remaining:state.remaining.slice(1),discards:state.current?[...state.discards,state.current]:[...state.discards],current:next,orientations:{...state.orientations,[next]:allowInverted&&random()<0.5}};}
  function valid(state,ids){
    if(!state||state.version!==1||!Array.isArray(state.remaining)||!Array.isArray(state.discards))return false;
    const drawn=[...state.discards,...(state.current===null?[]:[state.current])],all=[...state.remaining,...drawn];
    if(all.length!==ids.length||new Set(all).size!==ids.length||!all.every(id=>ids.includes(id)))return false;
    if(state.orientations!==undefined){
      if(!state.orientations||typeof state.orientations!=='object'||Array.isArray(state.orientations))return false;
      if(!Object.entries(state.orientations).every(([id,inverted])=>drawn.includes(id)&&typeof inverted==='boolean'))return false;
    }
    return true;
  }
  const api={shuffle,draw,valid};if(typeof module!=='undefined')module.exports=api;else root.TarotDeck=api;
})(globalThis);
