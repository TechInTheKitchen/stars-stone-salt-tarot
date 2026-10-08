const $=id=>document.getElementById(id);
const storageKey='tarot-desk-v1';
let cards=[],state,storageAvailable=true;
function read(key){try{return localStorage.getItem(key);}catch{storageAvailable=false;return null;}}
const desktop=matchMedia('(min-width:681px)');
let clickToDraw=read('tarot-desk-click-to-draw')!=='false';
let swapMobile=read('tarot-desk-swap-mobile')==='true';
let allowInverted=read('tarot-desk-allow-inverted')==='true';
function updateCardAction(){
 if(!state)return;
 const draws=desktop.matches?clickToDraw:(swapMobile||state.current===null);
 const enabled=draws&&state.remaining.length>0;
 $('card').disabled=draws?!enabled:desktop.matches;
 $('card').setAttribute('aria-label',desktop.matches?(enabled?'Draw next card':(current()?cardName(current()):'Tarot deck')):(draws?(enabled?'Draw next card':'Deck complete'):`Open information for ${cardName(current())}`));
 $('draw').disabled=(!desktop.matches&&swapMobile)?false:!state.remaining.length;
 $('draw').textContent=(!desktop.matches&&swapMobile)?'Card notes':(state.remaining.length?'Draw a card':'Deck complete');
}
desktop.addEventListener('change',updateCardAction);
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{storageAvailable=false;}}
function el(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
function current(){return cards.find(c=>c.id===state.current);}
function isInverted(id){return state?.orientations?.[id]===true;}
function cardName(c){return c.name+(isInverted(c.id)?' (Inverted)':'');}
function renderDiscards(){
 const pile=$('discards');pile.replaceChildren();pile.hidden=!state.discards.length;
 pile.setAttribute('aria-label',`Open discard pile: ${state.discards.length} discarded cards`);
 state.discards.slice(-3).forEach((id,index,array)=>{
  const c=cards.find(card=>card.id===id),image=document.createElement('img');
  image.src=c.image;image.alt='';image.setAttribute('aria-hidden','true');
  image.classList.toggle('inverted',isInverted(id));
  const frame=document.createElement('div');frame.className='discard-card';
  frame.style.setProperty('--fan-step',array.length-index);frame.style.zIndex=index;
  frame.append(image);pile.append(frame);
 });
}
function info(target){
 target.replaceChildren();const c=current();
 target.append(el('p',c?c.group:'YOUR NEXT CHAPTER','eyebrow'),el('h2',c?cardName(c):'A shuffled deck. An open mind.'));
 if(!c){target.append(el('p','Take a breath and draw your first card. Each draw stays on the table until you draw again. Previous cards move to the discard pile.'));return;}
 const inverted=isInverted(c.id),notes=inverted?c.inverted:c;
 const tags=el('div','','tags');(notes?.keywords||[]).forEach(k=>tags.append(el('span',k,'tag')));
 target.append(tags,el('h3',inverted?'Inverted meaning':'Meaning'),el('p',notes?.meaning||(inverted?'No inverted meaning configured for this card.':'')),el('h3','Reflection'),el('p',notes?.reflection||(inverted?'No inverted reflection configured for this card.':'')),el('h3','Rules / notes'),el('p',notes?.rules||(inverted?'No additional inverted rules for this card.':'No additional rules for this card.')));
}
function render(){const c=current();if(!c)$("card").setAttribute("aria-label","Open card information");$('card-image').hidden=!c;$('card-image').classList.toggle('inverted',!!c&&isInverted(c.id));$('card').querySelector('.card-back').hidden=!!c;if(c){$('card-image').src=c.image;$('card-image').alt=cardName(c);$('card').setAttribute('aria-label',`Open information for ${cardName(c)}`);}info($('info'));renderDiscards();updateCardAction();$('status').textContent=`${state.remaining.length} remaining · ${state.discards.length} discarded${c?' · 1 on the table':''}${storageAvailable?'':' · Storage unavailable: this session only'}`;}
function open(label){$('modal-label').textContent=label;$('modal-body').replaceChildren();if(!$('modal').open)$('modal').showModal();return $('modal-body');}
function inventory(){const body=open('YOUR DECK');body.append(el('h2','A place for every card'));const counts=el('div','','counts');counts.append(el('span',`${state.remaining.length} remaining`),el('span',`${state.discards.length} discarded`),el('span',`${state.current?1:0} on the table`));body.append(counts);if(current())body.append(el('p',`On the table: ${cardName(current())}`));body.append(el('h3','Discard pile · newest first'));if(!state.discards.length)body.append(el('p','No discarded cards yet. Your current card moves here on the next draw.'));const list=el('ol','','pile-list');[...state.discards].reverse().forEach(id=>list.append(el('li',cardName(cards.find(c=>c.id===id)))));body.append(list,el('p','The order of the remaining deck stays hidden until you draw.'));}
$('close').onclick=()=>$('modal').close();$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('modal').close();}});
function drawCard(){if(!state||!state.remaining.length)return;state=TarotDeck.draw(state,allowInverted);save();render();}
function showCardNotes(){if(!state)return;const body=open('CARD INFORMATION');info(body);const button=el('button','View discard pile & counts','primary');button.onclick=inventory;body.append(button);}
$('draw').onclick=()=>{if(!desktop.matches&&swapMobile)showCardNotes();else drawCard();};
$('card').onclick=()=>{if(!state)return;if(desktop.matches){if(clickToDraw)drawCard();return;}if(swapMobile||state.current===null){drawCard();return;}showCardNotes();};
$('discards').onclick=()=>{if(state)inventory();};
$('settings').onclick=()=>{
 if(!state)return;const body=open('DECK SETTINGS');body.append(el('h2','Your table'));
 const themeLabel=el('label','Theme','theme-label');themeLabel.htmlFor='theme-select';
 const themeSelect=document.createElement('select');themeSelect.id='theme-select';
 themes.forEach(theme=>{const option=el('option',theme.name);option.value=theme.id;themeSelect.append(option);});
 themeSelect.value=selectedTheme;themeSelect.onchange=()=>applyTheme(themeSelect.value);body.append(themeLabel,themeSelect);

 const label=el('label','','setting-toggle'),toggle=document.createElement('input');
 toggle.type='checkbox';toggle.checked=clickToDraw;
 toggle.onchange=()=>{clickToDraw=toggle.checked;try{localStorage.setItem('tarot-desk-click-to-draw',String(clickToDraw));}catch{storageAvailable=false;}render();};
 label.append(toggle,el('span','Click card to draw on desktop'));body.append(label,el('p','Desktop notes stay in the side panel. Mobile card and button actions follow the swap setting.'),el('h3','Shuffle the deck'),el('p','Shuffle all 78 cards back into the deck? This clears the current card and discard pile.'));
 const swapLabel=el('label','','setting-toggle'),swapToggle=document.createElement('input');
 swapToggle.type='checkbox';swapToggle.checked=swapMobile;
 swapToggle.onchange=()=>{swapMobile=swapToggle.checked;try{localStorage.setItem('tarot-desk-swap-mobile',String(swapMobile));}catch{storageAvailable=false;}render();};
 swapLabel.append(swapToggle,el('span','Swap draw button and rules interaction'));
 body.insertBefore(swapLabel,label.nextSibling);
 body.insertBefore(el('p','On mobile, enable this to tap the card to draw and use the button for notes.'),swapLabel.nextSibling);
 const invertedLabel=el('label','','setting-toggle'),invertedToggle=document.createElement('input');
 invertedToggle.type='checkbox';invertedToggle.checked=allowInverted;
 invertedToggle.onchange=()=>{allowInverted=invertedToggle.checked;try{localStorage.setItem('tarot-desk-allow-inverted',String(allowInverted));}catch{storageAvailable=false;}state=TarotDeck.shuffle(cards.map(c=>c.id));save();render();};
 invertedLabel.append(invertedToggle,el('span','Allow inverted cards (reshuffles deck)'));
 body.insertBefore(invertedLabel,body.querySelector('h3'));
 body.insertBefore(el('p','Changing this setting immediately reshuffles all 78 cards and clears the current card and discard pile. When enabled, each draw has a 50% chance of being inverted and shows its inverted meaning and notes.'),invertedLabel.nextSibling);
 const button=el('button','Shuffle the deck','primary');button.onclick=()=>{state=TarotDeck.shuffle(cards.map(c=>c.id));save();render();$('modal').close();};body.append(button);
};
const themes=[{id:'dusk',name:'Dusk'},{id:'ocean',name:'Ocean'},{id:'parchment',name:'Parchment'},{id:'sage',name:'Sage'}];
const savedTheme=read('tarot-desk-theme');
let selectedTheme;
const savedMode=read('tarot-desk-mode');
let selectedMode=['light','dark'].includes(savedMode)?savedMode:(['light','parchment','sage'].includes(savedTheme)?'light':'dark');
function applyTheme(id){
 const theme=themes.find(t=>t.id===id)||themes[0];selectedTheme=theme.id;
 $('theme-stylesheet').href='assets/themes/'+theme.id+'.css';
 document.documentElement.dataset.theme=selectedMode;
 $('theme').setAttribute('aria-label',selectedMode==='dark'?'Switch to light mode':'Switch to dark mode');
 try{localStorage.setItem('tarot-desk-theme',theme.id);localStorage.setItem('tarot-desk-mode',selectedMode);}catch{}
 const select=$('theme-select');if(select)select.value=theme.id;
}
applyTheme(savedTheme==='light'?'parchment':savedTheme==='dark'?'dusk':savedTheme);
$('theme').onclick=()=>{selectedMode=selectedMode==='dark'?'light':'dark';applyTheme(selectedTheme);};
(async()=>{try{const response=await fetch('assets/cards.json');if(!response.ok)throw Error('Card data could not be loaded.');cards=await response.json();if(cards.length!==78||new Set(cards.map(c=>c.id)).size!==78||cards.some(c=>!c.id||!c.name||!c.image||!Array.isArray(c.keywords)))throw Error('cards.json must contain 78 unique cards with names, images, and keyword arrays.');let cached;try{cached=JSON.parse(read(storageKey));}catch{}state=TarotDeck.valid(cached,cards.map(c=>c.id))?cached:TarotDeck.shuffle(cards.map(c=>c.id));save();render();}catch(error){$('status').textContent=`${error.message} Use tools/Open Site.cmd to serve the app, then reload.`;$('status').classList.add('error');$('draw').textContent='Deck unavailable';}})();



// Generate a square PNG favicon from the same symbol or loaded header artwork.
function updateFavicon(symbol,image){
 let link=$('site-favicon');
 if(!link){link=document.createElement('link');link.id='site-favicon';link.rel='icon';document.head.append(link);}
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
 const context=canvas.getContext('2d');
 if(!context){if(image)link.href=image.src;return;}
 if(image){
  const scale=64/Math.max(image.naturalWidth,image.naturalHeight);
  const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
  context.drawImage(image,(64-width)/2,(64-height)/2,width,height);
 }else if(symbol){
  context.fillStyle='#c9a66b';context.textAlign='center';context.textBaseline='middle';context.font='48px system-ui, sans-serif';
  const measured=context.measureText(symbol).width;
  if(measured>56)context.font=`${48*56/measured}px system-ui, sans-serif`;
  context.fillText(symbol,32,34);
 }
 try{link.href=canvas.toDataURL('image/png');link.type='image/png';}
 catch(error){if(image){link.removeAttribute('type');link.href=image.src;}}
}
updateFavicon($('header-icon').textContent);
// Optional artwork falls back to the configured text if it cannot load.
function configImage(target,path,onLoad){
 if(!path.trim())return;
 const image=document.createElement('img');image.alt='';image.hidden=true;
 image.onload=()=>{image.hidden=false;onLoad(image);};
 image.onerror=()=>{image.remove();console.warn(`Configured image could not be loaded: ${path}`);};
 target.append(image);image.src=path.trim();
}
(async()=>{
 try{
  const response=await fetch('assets/site-config.json');
  if(!response.ok)throw Error('Site config unavailable');
  const config=await response.json();
  if(typeof config.title!=='string'||typeof config.subtitle!=='string')throw Error('Site config needs title and subtitle strings');
  document.title=config.title;$('site-title').textContent=config.title;$('site-subtitle').textContent=config.subtitle;
  $('card-brand').textContent=config.title;
  if(config.headerIcon){
   const icon=config.headerIcon;
   if(typeof icon.symbol==='string'&&typeof icon.image==='string'){
    const target=$('header-icon');target.textContent=icon.symbol;
    updateFavicon(icon.symbol);
    configImage(target,icon.image,image=>{target.replaceChildren(image);updateFavicon(icon.symbol,image);});
   }else console.warn('headerIcon needs symbol and image strings');
  }
  if(config.cardBack){
   const backConfig=config.cardBack;
   if(['symbol','title','subtitle','image'].some(key=>typeof backConfig[key]!=='string'))throw Error('cardBack needs symbol, title, subtitle, and image strings');
   const back=$('card').querySelector('.card-back');
   back.querySelector('span').textContent=backConfig.symbol;
   $('card-brand').textContent=backConfig.title;
   back.querySelector('small').textContent=backConfig.subtitle;
   configImage(back,backConfig.image,()=>back.classList.add('has-image'));
  }
 }catch(error){console.warn(error.message);}
})();
