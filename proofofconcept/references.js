document.querySelectorAll('.demo-reference').forEach(link=>link.addEventListener('click',event=>{
 event.preventDefault();
 const target=document.getElementById(link.hash.slice(1));if(!target)return;
 if(link.dataset.demoAction==='log'){document.getElementById('evidenceBtn').click();return}
 if(link.dataset.demoAction==='difference'){document.getElementById('differenceBtn').click();return}
 const details=target.querySelector('details');if(details)details.open=true;
 target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
 target.focus({preventScroll:true});target.classList.remove('demo-reference-target');void target.offsetWidth;target.classList.add('demo-reference-target');
 setTimeout(()=>target.classList.remove('demo-reference-target'),2600);
}));
