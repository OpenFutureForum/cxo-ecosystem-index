const cards=[...document.querySelectorAll('.card[data-name]')];
const controls=[...document.querySelectorAll('.filters input,.filters select')];
const count=document.querySelector('#result-count');
const values=id=>document.querySelector(`#${id}`)?.value||'';
const contains=(card,key,value)=>!value||(card.dataset[key]||'').split('|').includes(value);
function apply(){
 const query=values('search').toLowerCase();
 const selected={cxo:values('cxo'),provider:values('provider'),format:values('format'),topic:values('topic'),need:values('need'),geo:values('geo')};
 let visible=0;
 for(const card of cards){
  const matches=(!query||card.textContent.toLowerCase().includes(query))&&Object.entries(selected).every(([key,value])=>contains(card,key,value));
  card.hidden=!matches;
  if(matches)visible++;
 }
 count.textContent=`${visible} organization${visible===1?'':'s'} shown`;
}
controls.forEach(control=>control.addEventListener('input',apply));
apply();
