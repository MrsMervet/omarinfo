(() => {
  "use strict";

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  // ---------- Flash cards ----------
  $$(".flash-card").forEach(card => {
    const flip = () => card.classList.toggle("flipped");
    card.addEventListener("click", flip);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        flip();
      }
    });
  });

  // ---------- Activity data ----------
  const mcq = [
    {
      q:"ما كُنْية عمر بن الخطاب رضي الله عنه؟",
      options:["أبو حفص","الفاروق","أمير المؤمنين","أبو جهل"],
      answer:0,
      info:"كُنْيته أبو حفص."
    },
    {
      q:"متى وُلِد عمر بن الخطاب؟",
      options:["بعد عام الفيل بثلاث عشرة سنة","سنة 23 هـ","قبل الهجرة بخمس سنين","سنة 24 هـ"],
      answer:0,
      info:"وُلِد بعد عام الفيل بثلاث عشرة سنة."
    },
    {
      q:"ما العمل الذي عمله عمر وهو صغير؟",
      options:["رعي الإبل","الزراعة","الحدادة","صناعة السفن"],
      answer:0,
      info:"عمل راعيًا للإبل وهو صغير."
    },
    {
      q:"أين أعلن عمر إسلامه؟",
      options:["دار الأرقم","القدس","الفسطاط","المدائن"],
      answer:0,
      info:"خرج إلى دار الأرقم وأعلن إسلامه."
    },
    {
      q:"بماذا صار عمر مضرب المثل بعد توليه الخلافة؟",
      options:["العدل","التجارة","المصارعة","الشعر"],
      answer:0,
      info:"صار مضرب المثل في العدل."
    },
    {
      q:"كم دامت خلافة عمر تقريبًا؟",
      options:["عشر سنوات ونصف","خمس سنوات","ثلاث عشرة سنة","ثلاثة أيام"],
      answer:0,
      info:"دامت خلافته نحو عشر سنوات ونصف."
    }
  ];

  const tf = [
    {q:"كان عمر أصغر من الرسول ﷺ بثلاث عشرة سنة.", answer:true, info:"نعم، ورد في الدرس أنه كان أصغر منه بثلاث عشرة سنة."},
    {q:"كان منزل عمر في الجاهلية عند أصل الجبل الذي يسمى اليوم جبل عمر.", answer:true, info:"هذه العبارة صحيحة."},
    {q:"كان عمر لا يعرف القراءة.", html:"كان عمر <span class=\"key-negative\">لا يعرف</span> القراءة.", answer:false, info:"خطأ؛ امتاز عمر بتعلّم القراءة."},
    {q:"استمر القتال في القادسية أربعة أيام.", answer:true, info:"صحيح؛ استمر القتال أربعة أيام."},
    {q:"ذهب عمر إلى القدس وعقد الصلح مع أهلها وأعطاهم الأمان.", answer:true, info:"هذه العبارة صحيحة."},
    {q:"استشهد عمر سنة ٤٢ هـ.", answer:false, info:"خطأ؛ استشهد سنة 23 هـ."}
  ];

  const dragItems = [
    {id:"kunya", label:"أبو حفص", target:"كنيته"},
    {id:"title", label:"الفاروق", target:"لقبه"},
    {id:"islam", label:"دار الأرقم", target:"أعلن عمر إسلامه في"},
    {id:"qadisiyah", label:"سعد بن أبي وقاص", target:"قائد المسلمين في القادسية"},
    {id:"egypt", label:"عمرو بن العاص", target:"القائد الذي توجّه إلى مصر"},
    {id:"death", label:"23 هـ", target:"استشهد عمر رضي الله عنه سنة"}
  ];

  let score = 0;
  let solved = 0;
  const total = mcq.length + tf.length + dragItems.length;
  const solvedKeys = new Set();
  let selectedDrag = null;

  function shuffle(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function showToast(text){
    const toast=$("#toast");
    toast.textContent=text;
    toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t=setTimeout(()=>toast.classList.remove("show"),1200);
  }

  function addSolved(key, points=1){
    if(solvedKeys.has(key)) return;
    solvedKeys.add(key);
    solved++;
    score+=points;
    updateScore();
  }

  function updateScore(){
    $("#score").textContent=score;
    const pct=Math.round((solved/total)*100);
    $("#progressText").textContent=pct+"%";
    $("#progressBar").style.width=pct+"%";
    if(solved===total) showToast("ممتاز! أنهيت جميع الأنشطة 🌟");
  }

  function renderMCQ(){
    const box=$("#mcqContainer");
    box.innerHTML="";
    mcq.forEach((item,idx)=>{
      const card=document.createElement("div");
      card.className="quiz-item";
      card.dataset.idx=idx;

      const q=document.createElement("div");
      q.className="quiz-q";
      q.innerHTML=`${idx+1}. ${item.html || item.q}`;
      card.appendChild(q);

      const options=document.createElement("div");
      options.className="options";

      // Shuffle while keeping correct mapping.
      const mapped=item.options.map((text,i)=>({text, correct:i===item.answer}));
      shuffle(mapped).forEach(opt=>{
        const b=document.createElement("button");
        b.className="option-btn";
        b.type="button";
        b.textContent=opt.text;
        b.addEventListener("click",()=>{
          if(card.classList.contains("solved")) return;
          if(opt.correct){
            b.classList.add("correct");
            card.classList.add("solved");
            $$(".option-btn",card).forEach(x=>x.disabled=true);
            $(".feedback-line",card).textContent="أحسنت! "+item.info;
            $(".feedback-line",card).className="feedback-line good";
            addSolved("m"+idx);
          }else{
            b.classList.add("wrong");
            b.disabled=true;
            $(".feedback-line",card).textContent="حاول مرة أخرى.";
            $(".feedback-line",card).className="feedback-line bad";
          }
        });
        options.appendChild(b);
      });

      card.appendChild(options);
      const fb=document.createElement("div");
      fb.className="feedback-line";
      card.appendChild(fb);
      box.appendChild(card);
    });
  }

  function renderTF(){
    const box=$("#tfContainer");
    box.innerHTML="";
    tf.forEach((item,idx)=>{
      const card=document.createElement("div");
      card.className="quiz-item";

      const q=document.createElement("div");
      q.className="quiz-q";
      q.innerHTML=`${idx+1}. ${item.html || item.q}`;
      card.appendChild(q);

      const options=document.createElement("div");
      options.className="options";

      [
        {label:"صح ✅",value:true},
        {label:"خطأ ❌",value:false}
      ].forEach(opt=>{
        const b=document.createElement("button");
        b.className="tf-btn";
        b.type="button";
        b.textContent=opt.label;
        b.addEventListener("click",()=>{
          if(card.classList.contains("solved")) return;
          if(opt.value===item.answer){
            b.classList.add("correct");
            card.classList.add("solved");
            $$(".tf-btn",card).forEach(x=>x.disabled=true);
            $(".feedback-line",card).textContent="أحسنت! "+item.info;
            $(".feedback-line",card).className="feedback-line good";
            addSolved("t"+idx);
          }else{
            b.classList.add("wrong");
            b.disabled=true;
            $(".feedback-line",card).textContent="ليست الإجابة الصحيحة، حاول مرة أخرى.";
            $(".feedback-line",card).className="feedback-line bad";
          }
        });
        options.appendChild(b);
      });

      card.appendChild(options);
      const fb=document.createElement("div");
      fb.className="feedback-line";
      card.appendChild(fb);
      box.appendChild(card);
    });
  }

  function renderDrag(){
    const bank=$("#dragBank");
    const grid=$("#dropGrid");
    bank.innerHTML="";
    grid.innerHTML="";
    selectedDrag=null;

    shuffle(dragItems).forEach(item=>{
      const chip=document.createElement("button");
      chip.className="drag-chip";
      chip.type="button";
      chip.draggable=true;
      chip.dataset.id=item.id;
      chip.textContent=item.label;

      chip.addEventListener("dragstart",e=>{
        e.dataTransfer.setData("text/plain",item.id);
        selectedDrag=item.id;
      });

      chip.addEventListener("click",()=>{
        $$(".drag-chip").forEach(x=>x.classList.remove("selected"));
        if(selectedDrag===item.id){
          selectedDrag=null;
          chip.classList.remove("selected");
        }else{
          selectedDrag=item.id;
          chip.classList.add("selected");
          showToast("الآن اضغط على المكان المناسب");
        }
      });

      bank.appendChild(chip);
    });

    shuffle(dragItems).forEach(item=>{
      const zone=document.createElement("div");
      zone.className="drop-zone";
      zone.dataset.target=item.id;
      zone.innerHTML=`<b>${item.target}</b><span>ضع البطاقة المناسبة هنا</span>`;

      zone.addEventListener("dragover",e=>{
        e.preventDefault();
        zone.classList.add("dragover");
      });
      zone.addEventListener("dragleave",()=>zone.classList.remove("dragover"));
      zone.addEventListener("drop",e=>{
        e.preventDefault();
        zone.classList.remove("dragover");
        const id=e.dataTransfer.getData("text/plain");
        attemptDrop(id,zone);
      });
      zone.addEventListener("click",()=>{
        if(selectedDrag) attemptDrop(selectedDrag,zone);
      });

      grid.appendChild(zone);
    });
  }

  function attemptDrop(id,zone){
    if(zone.classList.contains("correct")) return;
    const item=dragItems.find(x=>x.id===id);
    if(!item) return;

    if(zone.dataset.target===id){
      zone.classList.add("correct");
      zone.innerHTML=`<b>${item.target}</b><span class="drop-answer">✓ ${item.label}</span>`;
      const chip=$(`.drag-chip[data-id="${id}"]`);
      if(chip) chip.classList.add("placed");
      addSolved("d"+id);
      $("#dragMessage").textContent="أحسنت! مكان صحيح 🌟";
      $("#dragMessage").style.color="#157147";
      selectedDrag=null;
      $$(".drag-chip").forEach(x=>x.classList.remove("selected"));
    }else{
      $("#dragMessage").textContent="حاول مرة أخرى؛ هذه البطاقة لها مكان آخر.";
      $("#dragMessage").style.color="#a13b48";
      zone.animate(
        [{transform:"translateX(0)"},{transform:"translateX(7px)"},{transform:"translateX(-7px)"},{transform:"translateX(0)"}],
        {duration:260}
      );
    }
  }

  function resetAll(){
    score=0;solved=0;solvedKeys.clear();
    renderMCQ();renderTF();renderDrag();updateScore();
    $("#dragMessage").textContent="";
    showToast("تمت إعادة الأنشطة");
  }

  $("#resetAll").addEventListener("click",resetAll);

  renderMCQ();
  renderTF();
  renderDrag();
  updateScore();
})();
