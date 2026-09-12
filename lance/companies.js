(() => {
 const view=document.querySelector('#companies-view');
 function open(){
  document.dispatchEvent(new Event('storyboard:show'));
  document.querySelectorAll('.board').forEach(e=>e.hidden=true);
  view.hidden=false;
  document.body.classList.add('article-mode','company-mode');
  document.querySelector('#article-home').hidden=false;
  document.querySelector('#content').scrollTop=0;
  history.replaceState(null,'','#companies');
  document.querySelector('#companies-title').focus({preventScroll:true});
 }
 document.querySelector('#see-companies').onclick=e=>{e.preventDefault();open();};
 document.addEventListener('storyboard:show',()=>{view.hidden=true;document.body.classList.remove('company-mode');});
 window.addEventListener('hashchange',()=>{if(location.hash==='#companies')open();});
 if(location.hash==='#companies')open();
})();
