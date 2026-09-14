(() => {
 const form=document.querySelector('#quizForm');
 const questions=[...form.querySelectorAll('.quiz-question')];
 const card=form.closest('.card'),stage=form.closest('.stage');
 const submit=document.querySelector('#submitQuiz');
 let index=0,review=false;
 card.querySelector('.lead').textContent='Choose one answer per question. You can go back before submitting.';
 const progress=document.createElement('p');progress.className='quiz-progress';progress.setAttribute('aria-live','polite');form.before(progress);
 const back=document.createElement('button');back.type='button';back.className='secondary';back.textContent='Back';
 const next=document.createElement('button');next.type='button';next.className='primary-btn';next.textContent='Next question';
 submit.before(back,next);
 const finish=document.createElement('button');finish.type='button';finish.className='primary-btn';finish.textContent='Continue lesson';submit.after(finish);
 function render(focus=false){
  questions.forEach((q,i)=>q.hidden=i!==index);
  progress.textContent=`${review?'Review · ':''}Question ${index+1} of ${questions.length}`;
  back.disabled=index===0;
  const answered=!!questions[index].querySelector('input:checked');
  next.hidden=index===questions.length-1;next.disabled=!answered;
  submit.hidden=index!==questions.length-1||review;submit.disabled=!answered;
  finish.hidden=!review||index!==questions.length-1;
  if(focus){const h=questions[index].querySelector('h3');h.tabIndex=-1;h.focus({preventScroll:true});}
  card.dispatchEvent(new Event('quiz-layout',{bubbles:true}));
 }
 back.onclick=()=>{index=Math.max(0,index-1);render(true);};
 next.onclick=()=>{index=Math.min(questions.length-1,index+1);render(true);};
 form.addEventListener('change',()=>render());
 form.addEventListener('submit',e=>{e.preventDefault();if(index<4&&!next.disabled)next.click();else if(!submit.disabled)submit.click();});
 submit.addEventListener('click',()=>{review=true;render();});
 document.querySelector('#closeQuizModal').addEventListener('click',()=>{index=0;render(true);});
 ['resetQuiz','retryQuiz'].forEach(id=>document.querySelector('#'+id).addEventListener('click',()=>{index=0;review=false;render(true);}));
 finish.onclick=()=>document.querySelector('footer #next').click();
 const sync=()=>document.body.classList.toggle('quiz-paging',stage.classList.contains('active'));
 new MutationObserver(sync).observe(stage,{attributes:true,attributeFilter:['class']});sync();render();
})();
