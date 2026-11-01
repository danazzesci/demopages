(() => {
'use strict';
const form=document.querySelector('#exercise'), key='tea-case-form-v1',status=document.querySelector('#save-status');
const fields=[...form.elements].filter(e=>e.name);
function update(){
 for(let i=1;i<=7;i++){
  const used=form.elements['ai'+i].value==='used',details=document.querySelector('#disclosure'+i);
  details.hidden=!used;details.open=used;
  details.querySelectorAll('textarea,select').forEach(e=>e.required=used);
 }
 document.querySelectorAll('[data-for]').forEach(e=>e.textContent=document.getElementById(e.dataset.for).value);
}
try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object')for(const el of fields){if(typeof saved[el.name]!=='string')continue;if(el.type==='radio')el.checked=saved[el.name]===el.value;else el.value=saved[el.name];}}catch{status.textContent='Browser saving is unavailable. Keep this page open and print your work before leaving.';}
function save(){update();try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(new FormData(form))));status.textContent='Saved in this browser on this device. No answers are submitted by this page.';}catch{status.textContent='Browser saving is unavailable. Print your work before leaving this page.';}}
form.addEventListener('input',save);form.addEventListener('change',save);form.addEventListener('submit',e=>e.preventDefault());
window.addEventListener('beforeprint',update);
document.querySelector('#print').onclick=()=>{update();window.print();};
document.querySelector('#check').onclick=()=>{
 const review=document.querySelector('#review');review.replaceChildren();const missing=[];
 if(!form.elements.student.value.trim())missing.push(['Full name','student']);
 for(let i=1;i<=7;i++){
  for(const [field,label] of [['answer','response'],['sources','supporting sources'],['ai','AI-use choice']])if(!form.elements[field+i].value.trim())missing.push(['Question '+i+': '+label,'q'+i]);
  if(form.elements['ai'+i].value==='used')for(const field of ['how','contribution','confidence','justification'])if(!form.elements[field+i].value.trim())missing.push(['Question '+i+': AI '+field,'q'+i]);
 }
 const p=document.createElement('p');p.textContent=missing.length?'Please complete these fields before turning in your work:':'All required fields are filled. Review your evidence and print your form to turn in.';review.append(p);
 for(const [label,id]of missing){const a=document.createElement('a');a.textContent=label;a.href='#'+id;a.onclick=()=>{const target=document.getElementById(id)||form.elements[id];if(target?.focus)target.focus();};review.append(a);}
};
document.querySelector('#clear').onclick=()=>{if(!confirm('Clear all answers and saved work for this exercise on this device?'))return;form.reset();try{localStorage.removeItem(key);}catch{}update();document.querySelector('#review').replaceChildren();status.textContent='Form cleared. No answers have been submitted.';};
const example=document.querySelector('#ai-example');
let exampleOrigin=null;
document.querySelectorAll('.ai-example-link').forEach(link=>link.addEventListener('click',event=>{
 event.preventDefault();exampleOrigin=link;example.hidden=false;example.focus({preventScroll:true});example.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}));
function closeExample(){example.hidden=true;if(exampleOrigin){exampleOrigin.focus({preventScroll:true});exampleOrigin.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});}}
document.querySelector('#close-ai-example').addEventListener('click',closeExample);
example.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeExample();}});
update();
})();
