import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const C = {
  forest:"#2D6A4F", forestLight:"#40916C", forestDark:"#1B4332",
  mint:"#D8F3DC", mintDark:"#B7E4C7", off:"#F4F1E8",
  gold:"#D4A017", slate:"#2C3E50", slateLight:"#4A6278",
  white:"#FFFFFF", grey:"#8E9BAA", greyLight:"#E8EDF2",
  red:"#C0392B", blue:"#1A5276", purple:"#6C3483",
  orange:"#CA6F1E"
};
const PIES=["#2D6A4F","#40916C","#D4A017","#1A5276","#CA6F1E","#6C3483","#C0392B","#74C69D"];

async function submitResponse(data) {
  try {
    const res = await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch { return false; }
}

async function fetchResponses() {
  try {
    const res = await fetch("/api/responses");
    if (!res.ok) return null;
    const { responses } = await res.json();
    return responses;
  } catch { return null; }
}

const SECTIONS = [
  {
    id:"demographics", title:"About You", icon:"👤", color:C.forest,
    questions:[
      {id:"q1",type:"radio",text:"How often do you travel internationally?",options:["Once or twice a year","3–5 times a year","More than 5 times a year","I rarely travel internationally"]},
      {id:"q2",type:"radio",text:"Which best describes you as a traveller?",options:["Business traveller","Leisure traveller","Both equally","I don't travel often"]},
      {id:"q3",type:"radio",text:"How health-conscious would you say you are?",options:["Very health-conscious","Somewhat health-conscious","Neutral","Not particularly health-conscious"]},
      {id:"q4",type:"radio",text:"What is your age group?",options:["18–24","25–34","35–44","45–54","55+"]},
    ]
  },
  {
    id:"nutrition_awareness", title:"Nutrition Label Habits", icon:"🔍", color:C.blue,
    intro:"These questions help us understand how you currently read and respond to nutritional information on food and supplement products.",
    questions:[
      {id:"q5",type:"radio",text:"When you pick up a food or supplement product, how often do you read the nutrition label?",options:["Always — it is the first thing I check","Usually — I check it most of the time","Sometimes — only if I am curious","Rarely — I rely on the brand name or packaging design"]},
      {id:"q6",type:"checkbox",text:"Which nutrition label claims would most influence you to try a new natural food product? (Select all that apply)",options:["Source of dietary fibre","High in Vitamin C","No added sugars","Low calorie","No artificial additives","Organic certified","Non-GMO","Upcycled ingredients"]},
      {id:"q7",type:"radio",text:"How important is it that a food product's nutrition claims are verified by an independent authority (such as EFSA)?",options:["Very important — I only trust verified claims","Somewhat important — it adds credibility","Neutral — I judge by the ingredient list","Not important — I trust the brand itself"]},
    ]
  },
  {
    id:"fibre_vitamin", title:"Fibre & Vitamin C Claims", icon:"🍋", color:"#40916C",
    intro:"GoJuice is a natural digestive powder made from pineapple, kiwi, ginger, and peppermint. Rate the following specific nutrition claims it could legally make under EU regulation.",
    questions:[
      {
        id:"q9_10",
        type:"dual_scale",
        items:[
          {id:"q9", label:"'Source of dietary fibre — supports your digestive system'", sublabel:"How trustworthy does this claim feel on a natural fruit powder?"},
          {id:"q10", label:"'Source of Vitamin C'", sublabel:"How likely would this claim make you pick up GoJuice at an airport convenience store?"},
        ]
      },
      {id:"q11",type:"radio",text:"If you saw both 'Source of dietary fibre' AND 'Source of Vitamin C' on the GoJuice label together, how would that affect your perception?",options:["Very positive — confirms the product is genuinely nutritious","Positive — adds credibility to the natural positioning","Neutral — I would still focus on the ingredient list","Negative — it feels like over-claiming for a powder product"]},
      {id:"q12",type:"radio",text:"Between these two claims, which is more relevant to why you might use a digestive powder while travelling?",options:["Source of dietary fibre — directly linked to digestion","Source of Vitamin C — supports overall health and immunity","Both are equally relevant","Neither feels specifically relevant to digestive support"]},
    ]
  },
  {
    id:"no_added_sugar", title:"No Added Sugar & Low Calorie", icon:"🍃", color:C.gold,
    intro:"GoJuice uses stevia as a natural sweetener and contains no added sugars. Rate how these claims land with you as a consumer.",
    questions:[
      {id:"q13",type:"scale",text:"How important is 'No added sugars' when choosing a health or wellness product while travelling?"},
      {id:"q14",type:"scale",text:"How trustworthy does 'No added sugars — sweetened only with stevia' feel on a natural digestive powder?"},
      {id:"q15",type:"radio",text:"Would knowing GoJuice contains no added sugars and is sweetened only with stevia make you more or less likely to try it?",options:["Much more likely — this is exactly what I look for","Slightly more likely — it aligns with my preferences","No difference — sugar content is not a priority for me","Less likely — I am not a fan of stevia-sweetened products"]},
      {id:"q16",type:"radio",text:"If GoJuice could claim 'Low calorie' (under 40 kcal per serving), how much would this influence your airport purchase decision?",options:["Significantly — low calorie claims are very important to me","Somewhat — it would be a nice bonus","Slightly — I would notice it but it would not drive the decision","Not at all — calorie count is not relevant for this type of product"]},
    ]
  },
  {
    id:"label_language", title:"Label Language Comparison", icon:"🏷️", color:C.purple,
    intro:"Below are three different ways GoJuice could present its nutritional information. Please compare them and share your preferences.",
    questions:[
      {id:"q17",type:"radio",text:"Which label approach makes you most likely to trust GoJuice as a genuinely healthy product?",options:["Option A: 'Source of fibre · Source of Vitamin C · No added sugars · Low calorie'","Option B: 'Made with pineapple, kiwi, ginger and peppermint — naturally rich in fibre and Vitamin C'","Option C: A combination of both — nutrition badges AND a natural ingredient description","None of these — I would need to see the full ingredient list first"]},
      {id:"q18",type:"scale",text:"How professional and credible does a label with clear nutrition claim badges (e.g. 'Source of Fibre ✓ No Added Sugars ✓') feel compared to plain text?"},
      {id:"q19",type:"radio",text:"GoJuice's slogan is 'Travel Light. Digest Right.' Combined with nutrition claim badges, how well does this communicate the product's purpose?",options:["Very well — clear, memorable, and relevant to travel","Well — I understand the product immediately","Somewhat — the slogan is good but the claims feel generic","Poorly — it does not clearly communicate what the product does"]},
      {id:"q20",type:"checkbox",text:"Which phrases would you most want to see on a GoJuice label in addition to nutrition claims? (Select all that apply)",options:["'Made from upcycled fruits and herbs'","'Naturally occurring digestive enzymes'","'No pills. No chemicals. Just nature.'","'Dissolves in water in under 30 seconds'","'Suitable for all ages'","'EFSA compliant claims'","'Produced in the Netherlands'"]},
    ]
  }
];

function ScaleInput({value,onChange,accent=C.forest}){
  return(
    <div style={{marginTop:14}}>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        {[1,2,3,4,5].map(n=>(
          <button key={n} onClick={()=>onChange(n)} style={{
            width:48,height:48,borderRadius:"50%",
            border:`2.5px solid ${value===n?accent:C.greyLight}`,
            background:value===n?accent:C.white,
            color:value===n?C.white:C.slate,
            fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit",
            transition:"all 0.18s",
            boxShadow:value===n?`0 4px 16px ${accent}44`:"none",
            transform:value===n?"scale(1.12)":"scale(1)"
          }}>{n}</button>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:C.grey,padding:"0 6px"}}>
        <span>1 = Not at all</span><span>5 = Strongly agree</span>
      </div>
    </div>
  );
}

function DualScaleInput({items,values={},onChange,accent=C.forest}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20,marginTop:4}}>
      {items.map(item=>(
        <div key={item.id} style={{padding:"14px 16px",background:C.off,borderRadius:10,border:`1.5px solid ${C.greyLight}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.slate,marginBottom:2}}>{item.label}</div>
          <div style={{fontSize:12,color:C.grey,marginBottom:10}}>{item.sublabel}</div>
          <ScaleInput value={values[item.id]} onChange={v=>onChange(item.id,v)} accent={accent}/>
        </div>
      ))}
    </div>
  );
}

function RadioInput({options,value,onChange,accent=C.forest}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
      {options.map(opt=>(
        <div key={opt} onClick={()=>onChange(opt)} style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",padding:"10px 16px",borderRadius:10,border:`1.5px solid ${value===opt?accent:C.greyLight}`,background:value===opt?`${accent}14`:C.white,transition:"all 0.15s"}}>
          <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,marginTop:1,border:`2px solid ${value===opt?accent:C.grey}`,background:value===opt?accent:C.white,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {value===opt&&<div style={{width:8,height:8,borderRadius:"50%",background:C.white}}/>}
          </div>
          <span style={{fontSize:13,color:C.slate,lineHeight:1.5}}>{opt}</span>
        </div>
      ))}
    </div>
  );
}

function CheckboxInput({options,value=[],onChange,accent=C.forest}){
  const toggle=opt=>onChange(value.includes(opt)?value.filter(v=>v!==opt):[...value,opt]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
      {options.map(opt=>(
        <div key={opt} onClick={()=>toggle(opt)} style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",padding:"10px 16px",borderRadius:10,border:`1.5px solid ${value.includes(opt)?accent:C.greyLight}`,background:value.includes(opt)?`${accent}14`:C.white,transition:"all 0.15s"}}>
          <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,border:`2px solid ${value.includes(opt)?accent:C.grey}`,background:value.includes(opt)?accent:C.white,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {value.includes(opt)&&<span style={{color:C.white,fontSize:12,fontWeight:900,lineHeight:1}}>✓</span>}
          </div>
          <span style={{fontSize:13,color:C.slate,lineHeight:1.5}}>{opt}</span>
        </div>
      ))}
    </div>
  );
}

function Analytics({onBack}){
  const [responses,setResponses]=useState([]);
  const [loading,setLoading]=useState(true);
  const [source,setSource]=useState("shared");

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const shared=await fetchResponses();
      if(shared&&shared.length>=0){setResponses(shared);setSource("shared");}
      else{
        try{const saved=localStorage.getItem("gj_nutrition_v1");setResponses(saved?JSON.parse(saved):[]);setSource("local");}
        catch{setResponses([]);}
      }
      setLoading(false);
    }
    load();
  },[]);

  const n=responses.length;

  if(loading) return(
    <div style={{minHeight:"100vh",background:C.off,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>🌿</div>
        <div style={{fontSize:16,color:C.slate,fontWeight:600}}>Loading responses...</div>
      </div>
    </div>
  );

  if(n===0) return(
    <div style={{minHeight:"100vh",background:C.off,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",padding:60}}>
        <div style={{fontSize:64,marginBottom:16}}>📊</div>
        <p style={{fontSize:18,fontWeight:700,color:C.slate,marginBottom:8}}>No responses yet</p>
        <p style={{fontSize:14,color:C.grey,marginBottom:24}}>Share the survey link and responses will appear here from all devices</p>
        <button onClick={onBack} style={{padding:"12px 28px",background:C.forest,color:C.white,border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>← Back to Survey</button>
      </div>
    </div>
  );

  const avg=ids=>{const vals=ids.flatMap(id=>responses.map(r=>r[id]).filter(v=>typeof v==="number"));return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2):0;};
  const optPie=(id,opts)=>opts.map(o=>({name:o,value:responses.filter(r=>r[id]===o).length})).filter(d=>d.value>0);
  const checkData=(id,opts)=>opts.map(o=>({name:o,value:responses.filter(r=>r[id]&&r[id].includes(o)).length})).sort((a,b)=>b.value-a.value);

  const fibreScore=parseFloat(avg(["q9"]));
  const vitCScore=parseFloat(avg(["q10"]));
  const noSugarScore=parseFloat(avg(["q13"]));

  const claimsBar=[
    {name:"Source of Fibre",score:fibreScore,fill:C.forest},
    {name:"Vitamin C",score:vitCScore,fill:C.forestLight},
    {name:"No Added Sugar",score:noSugarScore,fill:C.gold},
    {name:"Low Calorie",score:parseFloat(avg(["q16"])),fill:C.blue},
  ];

  const labelPref=optPie("q17",SECTIONS[4].questions[0].options);
  const sugarImpact=optPie("q15",SECTIONS[3].questions[2].options);
  const claimChecks=checkData("q6",SECTIONS[1].questions[1].options);
  const extraPhrases=checkData("q20",SECTIONS[4].questions[3].options);

  const exportCSV=()=>{
    if(!responses.length)return;
    const keys=Object.keys(responses[0]);
    const csv=[keys.join(","),...responses.map(r=>keys.map(k=>`"${Array.isArray(r[k])?r[k].join("; "):r[k]||""}"`).join(","))].join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="GoJuice_Survey.csv";a.click();
  };

  const Card=({title,children,accent=C.forest})=>(
    <div style={{background:C.white,borderRadius:16,padding:"20px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.06)",border:`1.5px solid ${C.greyLight}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:accent,borderRadius:"16px 16px 0 0"}}/>
      <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.2px",color:C.grey,marginBottom:16}}>{title}</div>
      {children}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.off}}>
      <div style={{background:C.forestDark,padding:"18px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:24}}>🌿</span>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:C.white}}>GoJuice — Nutrition Claims Analytics</div>
            <div style={{fontSize:11,color:C.mintDark}}>{n} response{n!==1?"s":""} | {source==="shared"?"🟢 Live shared database":"🟡 Local device only"} | Van Hall Larenstein</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>window.location.reload()} style={{padding:"8px 18px",background:"rgba(255,255,255,0.1)",color:C.white,border:"1.5px solid rgba(255,255,255,0.2)",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>🔄 Refresh</button>
          <button onClick={exportCSV} style={{padding:"8px 18px",background:C.gold,color:C.white,border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>⬇ Export CSV</button>
          <button onClick={onBack} style={{padding:"8px 18px",background:"rgba(255,255,255,0.1)",color:C.white,border:"1.5px solid rgba(255,255,255,0.2)",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>← Survey</button>
        </div>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"32px 24px 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
          {[
            {val:n,label:"Total Responses",sub:n<30?"⚠ Need 30+ for reliability":"✅ Good sample size",color:n<30?C.red:C.forest},
            {val:`${fibreScore}/5`,label:"Fibre Claim Score",sub:"Trustworthiness rating",color:C.forestLight},
            {val:`${vitCScore}/5`,label:"Vitamin C Claim Score",sub:"Purchase influence rating",color:C.gold},
          ].map((k,i)=>(
            <div key={i} style={{background:C.white,borderRadius:16,padding:"20px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.06)",border:`1.5px solid ${C.greyLight}`,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:k.color,borderRadius:"16px 16px 0 0"}}/>
              <div style={{fontSize:32,fontWeight:900,color:k.color,lineHeight:1}}>{k.val}</div>
              <div style={{fontSize:13,fontWeight:600,color:C.slate,marginTop:6}}>{k.label}</div>
              <div style={{fontSize:11,color:C.grey,marginTop:3}}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <Card title="Nutrition Claim Scores — Avg /5" accent={C.forest}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={claimsBar} margin={{left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.greyLight}/>
                <XAxis dataKey="name" tick={{fontSize:10,fill:C.grey}}/>
                <YAxis domain={[0,5]} tick={{fontSize:11,fill:C.grey}}/>
                <Tooltip formatter={v=>[`${v}/5`,"Score"]} contentStyle={{borderRadius:8,fontSize:12}}/>
                <Bar dataKey="score" radius={[6,6,0,0]}><Cell fill={C.forest}/><Cell fill={C.forestLight}/><Cell fill={C.gold}/><Cell fill={C.blue}/></Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Most Influential Nutrition Claims" accent={C.blue}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={claimChecks} layout="vertical" margin={{left:0,right:8}}>
                <XAxis type="number" tick={{fontSize:10,fill:C.grey}}/>
                <YAxis dataKey="name" type="category" tick={{fontSize:9,fill:C.grey}} width={120}/>
                <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                <Bar dataKey="value" fill={C.blue} radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <Card title="Label Approach Preference" accent={C.purple}>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart><Pie data={labelPref} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>{labelPref.map((_,i)=><Cell key={i} fill={PIES[i]}/>)}</Pie><Tooltip formatter={v=>[v,"Responses"]} contentStyle={{borderRadius:8,fontSize:12}}/><Legend iconSize={10} wrapperStyle={{fontSize:9}}/></PieChart>
            </ResponsiveContainer>
          </Card>
          <Card title="No Added Sugars / Stevia Impact on Purchase" accent={C.gold}>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart><Pie data={sugarImpact} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>{sugarImpact.map((_,i)=><Cell key={i} fill={PIES[i]}/>)}</Pie><Tooltip formatter={v=>[v,"Responses"]} contentStyle={{borderRadius:8,fontSize:12}}/><Legend iconSize={10} wrapperStyle={{fontSize:9}}/></PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Additional Label Phrases Respondents Want to See" accent={C.forestLight}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={extraPhrases} layout="vertical" margin={{left:0,right:8}}>
              <XAxis type="number" tick={{fontSize:10,fill:C.grey}}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:9,fill:C.grey}} width={180}/>
              <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
              <Bar dataKey="value" fill={C.forestLight} radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

export default function App(){
  const [view,setView]=useState("survey");
  const [section,setSection]=useState(0);
  const [answers,setAnswers]=useState({});
  const [submitting,setSubmitting]=useState(false);

  if(view==="analytics") return <Analytics onBack={()=>setView("survey")}/>;

  const sec=SECTIONS[section];
  const total=SECTIONS.length;
  const pct=Math.round(((section+1)/total)*100);
  const set=(id,val)=>setAnswers(p=>({...p,[id]:val}));
  const setDual=(id,val)=>setAnswers(p=>({...p,[id]:val}));
  const goTo=(i)=>{setSection(i);window.scrollTo(0,0);};

  const submit=async()=>{
    setSubmitting(true);
    const data={...answers,ts:new Date().toISOString()};
    const ok=await submitResponse(data);
    if(!ok){
      try{
        const saved=localStorage.getItem("gj_nutrition_v1");
        const existing=saved?JSON.parse(saved):[];
        localStorage.setItem("gj_nutrition_v1",JSON.stringify([...existing,data]));
      }catch{}
    }
    setSubmitting(false);
    setView("done");
  };

  if(view==="done") return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.forestDark},${C.forestLight})`,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:C.white,borderRadius:24,padding:48,maxWidth:440,width:"100%",textAlign:"center",boxShadow:"0 16px 64px rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:56,marginBottom:16}}>🌿</div>
        <h2 style={{fontSize:26,fontWeight:900,color:C.forestDark,marginBottom:12}}>Thank you!</h2>
        <p style={{fontSize:14,color:C.slateLight,lineHeight:1.8,marginBottom:28}}>Your response has been recorded and will contribute to the GoJuice nutrition claims research at Van Hall Larenstein University. We appreciate your time.</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>{setAnswers({});setSection(0);setView("survey");}} style={{padding:"11px 22px",background:C.forest,color:C.white,border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Fill Again</button>
          <button onClick={()=>setView("analytics")} style={{padding:"11px 22px",background:C.white,color:C.forest,border:`2px solid ${C.forest}`,borderRadius:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>View Analytics 📊</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.off}}>
      {/* Sticky header */}
      <div style={{background:C.forestDark,padding:"16px 24px",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>🌿</span>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:C.white}}>GoJuice — Nutrition Claims Survey</div>
                <div style={{fontSize:10,color:C.mintDark}}>Van Hall Larenstein University | IPRL Research | May 2026</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>setView("analytics")} style={{padding:"6px 12px",background:C.gold,color:C.white,border:"none",borderRadius:7,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>📊 Results</button>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{height:5,background:"rgba(255,255,255,0.15)",borderRadius:3}}>
            <div style={{height:"100%",width:`${pct}%`,background:C.gold,borderRadius:3,transition:"width 0.4s"}}/>
          </div>
          {/* Section tabs — all clickable */}
          <div style={{display:"flex",gap:0,marginTop:10,overflowX:"auto"}}>
            {SECTIONS.map((s,i)=>(
              <div key={s.id} onClick={()=>goTo(i)} style={{
                padding:"6px 10px",fontSize:10,
                color:i===section?C.gold:C.mintDark,
                borderBottom:`2px solid ${i===section?C.gold:"transparent"}`,
                fontWeight:i===section?700:400,
                whiteSpace:"nowrap",cursor:"pointer",
                transition:"all 0.15s",
                borderRadius:"4px 4px 0 0",
              }}>
                {s.icon} {s.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 120px"}}>
        {section===0&&(
          <div style={{padding:"12px 16px",background:C.mint,borderRadius:10,borderLeft:`4px solid ${C.forest}`,fontSize:12,color:C.slateLight,lineHeight:1.7,marginBottom:24}}>
            <strong style={{color:C.forestDark}}>Why this survey?</strong> Following expert advice from a food business owner interview, this survey focuses on <strong>nutrition claims</strong> as the safest and most achievable route for GoJuice to communicate its health benefits under EU Regulation (EC) No 1924/2006.
          </div>
        )}
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:44,height:44,borderRadius:12,background:sec.color||C.forest,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{sec.icon}</div>
            <div>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.grey}}>Section {section+1} of {total}</div>
              <h2 style={{fontSize:22,fontWeight:900,color:C.forestDark,margin:0}}>{sec.title}</h2>
            </div>
          </div>
          {sec.intro&&<div style={{padding:"12px 16px",background:`${sec.color}18`,borderRadius:10,borderLeft:`4px solid ${sec.color}`,fontSize:13,color:C.slateLight,lineHeight:1.7}}>{sec.intro}</div>}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {sec.questions.map((q,qi)=>(
            <div key={q.id} style={{background:C.white,borderRadius:16,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",border:`1.5px solid ${C.greyLight}`}}>
              {q.type==="dual_scale" ? (
                <>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:sec.color||C.forest,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.white,flexShrink:0,marginTop:1}}>{qi+1}</div>
                    <p style={{fontSize:14,fontWeight:600,color:C.slate,lineHeight:1.6,margin:0}}>Rate these nutrition claims <span style={{fontSize:11,color:C.grey,fontWeight:400}}>(1 = Not at all · 5 = Strongly agree)</span></p>
                  </div>
                  <div style={{marginLeft:34}}>
                    <DualScaleInput
                      items={q.items}
                      values={answers}
                      onChange={(id,v)=>set(id,v)}
                      accent={sec.color||C.forest}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:4}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:sec.color||C.forest,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.white,flexShrink:0,marginTop:1}}>{qi+1}</div>
                    <p style={{fontSize:14,fontWeight:600,color:C.slate,lineHeight:1.6,margin:0}}>{q.text}{q.optional&&<span style={{fontSize:11,color:C.grey,fontWeight:400,marginLeft:6}}>(Optional)</span>}</p>
                  </div>
                  <div style={{marginLeft:34}}>
                    {q.type==="radio"&&<RadioInput options={q.options} value={answers[q.id]} onChange={v=>set(q.id,v)} accent={sec.color||C.forest}/>}
                    {q.type==="checkbox"&&<CheckboxInput options={q.options} value={answers[q.id]} onChange={v=>set(q.id,v)} accent={sec.color||C.forest}/>}
                    {q.type==="scale"&&<ScaleInput value={answers[q.id]} onChange={v=>set(q.id,v)} accent={sec.color||C.forest}/>}
                    {q.type==="text"&&<textarea value={answers[q.id]||""} onChange={e=>set(q.id,e.target.value)} placeholder="Type your answer here..." style={{width:"100%",minHeight:80,marginTop:10,padding:"10px 14px",border:`1.5px solid ${C.greyLight}`,borderRadius:8,fontSize:13,fontFamily:"inherit",color:C.slate,resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.6}}/>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.white,borderTop:`1px solid ${C.greyLight}`,padding:"14px 20px",boxShadow:"0 -4px 20px rgba(0,0,0,0.08)"}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>goTo(section-1)} disabled={section===0}
            style={{padding:"11px 22px",background:C.white,color:section===0?C.grey:C.forest,border:`2px solid ${section===0?C.greyLight:C.forest}`,borderRadius:10,fontWeight:700,cursor:section===0?"default":"pointer",fontFamily:"inherit",fontSize:13,opacity:section===0?0.5:1}}>
            ← Back
          </button>
          <span style={{fontSize:12,color:C.grey}}>Section {section+1} of {total}</span>
          <div style={{display:"flex",gap:8}}>
            {section<total-1&&(
              <button onClick={()=>goTo(section+1)} style={{padding:"11px 22px",background:sec.color||C.forest,color:C.white,border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>
                Next →
              </button>
            )}
            {section===total-1&&(
              <button onClick={submit} disabled={submitting} style={{padding:"11px 26px",background:sec.color||C.forest,color:C.white,border:"none",borderRadius:10,fontWeight:700,cursor:submitting?"wait":"pointer",fontFamily:"inherit",fontSize:13,opacity:submitting?0.7:1}}>
                {submitting?"Saving...":"Submit ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
