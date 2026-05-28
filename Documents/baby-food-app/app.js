const { useState, useRef, useEffect } = React;

// ── API CALL ─────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const messages = typeof prompt === "string"
    ? [{ role: "user", content: prompt }]
    : [{ role: "user", content: JSON.parse(prompt) }];

  const response = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

// ── STORAGE HELPERS ───────────────────────────────────────────────────────────
const storage = {
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {} },
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; } }
};


const C = {
  orange:"#FF8C42",yellow:"#FFD166",green:"#06D6A0",purple:"#9B5DE5",
  pink:"#F72585",blue:"#4361EE",cream:"#FFF9F0",white:"#FFFFFF",
  dark:"#2D3047",light:"#FFE8D6",red:"#EF4444",amber:"#F59E0B",
};
const CARD_COLORS = [
  {bg:`linear-gradient(135deg,#FF8C42,#FFD166)`,s:`#FF8C4244`},
  {bg:`linear-gradient(135deg,#9B5DE5,#4361EE)`,s:`#9B5DE544`},
  {bg:`linear-gradient(135deg,#06D6A0,#4361EE)`,s:`#06D6A044`},
  {bg:`linear-gradient(135deg,#F72585,#FF8C42)`,s:`#F7258544`},
  {bg:`linear-gradient(135deg,#4361EE,#9B5DE5)`,s:`#4361EE44`},
];
const SK = {settings:"bfa-settings-v1",cookbook:"bfa-cookbook-v1",tracker:"bfa-tracker-v1",planner:"bfa-planner-v1",ratings:"bfa-ratings-v1"};
const LANGUAGES = [{code:"English",label:"🇬🇧 EN"},{code:"Bahasa Malaysia",label:"🇲🇾 BM"},{code:"Mandarin Chinese",label:"🇨🇳 中文"},{code:"Tamil",label:"🇮🇳 தமிழ்"}];
const AGES = [
  {value:"6-8 months",label:"6-8 months",emoji:"🌱",texture:"completely smooth puree, no lumps, very watery"},
  {value:"9-11 months",label:"9-11 months",emoji:"🌿",texture:"thick smooth puree, slightly thicker, soft tiny lumps ok"},
  {value:"12-14 months",label:"12-14 months",emoji:"🌳",texture:"mashed with soft lumps, finger food friendly"},
  {value:"15-18 months",label:"15-18 months",emoji:"⭐",texture:"soft chopped pieces, minced meat ok"},
  {value:"19-24 months",label:"19-24 months",emoji:"🌟",texture:"minced or finely chopped, small bite sized"},
  {value:"2-3 years",label:"2-3 years",emoji:"🚀",texture:"normal soft food, cut smaller than adult"},
  {value:"3-4 years",label:"3-4 years",emoji:"🎯",texture:"almost adult food, cut into manageable pieces"},
];
const METHODS = [
  {value:"Thermomix TM6",label:"Thermomix",emoji:"🤖"},
  {value:"stovetop",label:"Stovetop",emoji:"🔥"},
  {value:"steamer",label:"Steamer",emoji:"♨️"},
  {value:"oven",label:"Oven",emoji:"🫙"},
  {value:"no-cook",label:"No Cook",emoji:"❄️"},
];
const ALLERGENS = [
  {value:"nuts",label:"🥜 No Nuts"},{value:"dairy",label:"🥛 No Dairy"},
  {value:"eggs",label:"🥚 No Eggs"},{value:"gluten",label:"🌾 No Gluten"},
  {value:"seafood",label:"🦐 No Seafood"},{value:"soy",label:"🫘 No Soy"},
];
const FOOD_LIBRARY = {
  "🥕 Vegetables":[
    {name:"Sweet Potato",minAge:"6-8 months",emoji:"🍠"},{name:"Carrot",minAge:"6-8 months",emoji:"🥕"},
    {name:"Pumpkin",minAge:"6-8 months",emoji:"🎃"},{name:"Peas",minAge:"6-8 months",emoji:"🟢"},
    {name:"Spinach",minAge:"6-8 months",emoji:"🌿"},{name:"Broccoli",minAge:"6-8 months",emoji:"🥦"},
    {name:"Potato",minAge:"6-8 months",emoji:"🥔"},{name:"Zucchini",minAge:"6-8 months",emoji:"🫛"},
    {name:"Corn",minAge:"9-11 months",emoji:"🌽"},{name:"Tomato",minAge:"9-11 months",emoji:"🍅"},
    {name:"Beetroot",minAge:"9-11 months",emoji:"🟣"},{name:"Cauliflower",minAge:"6-8 months",emoji:"⚪"},
  ],
  "🍎 Fruits":[
    {name:"Apple",minAge:"6-8 months",emoji:"🍎"},{name:"Pear",minAge:"6-8 months",emoji:"🍐"},
    {name:"Banana",minAge:"6-8 months",emoji:"🍌"},{name:"Avocado",minAge:"6-8 months",emoji:"🥑"},
    {name:"Mango",minAge:"6-8 months",emoji:"🥭"},{name:"Papaya",minAge:"6-8 months",emoji:"🍈"},
    {name:"Peach",minAge:"6-8 months",emoji:"🍑"},{name:"Watermelon",minAge:"9-11 months",emoji:"🍉"},
    {name:"Blueberry",minAge:"9-11 months",emoji:"🫐"},{name:"Strawberry",minAge:"9-11 months",emoji:"🍓"},
    {name:"Kiwi",minAge:"9-11 months",emoji:"🥝"},{name:"Orange",minAge:"9-11 months",emoji:"🍊"},
  ],
  "🍗 Proteins":[
    {name:"Chicken",minAge:"6-8 months",emoji:"🍗"},{name:"Beef",minAge:"6-8 months",emoji:"🥩"},
    {name:"Salmon",minAge:"6-8 months",emoji:"🐟"},{name:"Tofu",minAge:"6-8 months",emoji:"⬜"},
    {name:"Lentils",minAge:"6-8 months",emoji:"🫘"},{name:"Egg Yolk",minAge:"6-8 months",emoji:"🥚"},
    {name:"Whole Egg",minAge:"9-11 months",emoji:"🍳"},{name:"Tuna",minAge:"9-11 months",emoji:"🐠"},
    {name:"Chickpeas",minAge:"9-11 months",emoji:"🟡"},{name:"Peanut Butter",minAge:"6-8 months",emoji:"🥜"},
  ],
  "🌾 Grains":[
    {name:"Rice Cereal",minAge:"6-8 months",emoji:"🍚"},{name:"Oatmeal",minAge:"6-8 months",emoji:"🥣"},
    {name:"Brown Rice",minAge:"6-8 months",emoji:"🍙"},{name:"Quinoa",minAge:"6-8 months",emoji:"⭐"},
    {name:"Bread (soft)",minAge:"9-11 months",emoji:"🍞"},{name:"Pasta (soft)",minAge:"9-11 months",emoji:"🍝"},
  ],
  "🥛 Dairy":[
    {name:"Yogurt (plain)",minAge:"6-8 months",emoji:"🥛"},{name:"Cheese (soft)",minAge:"9-11 months",emoji:"🧀"},
    {name:"Cottage Cheese",minAge:"9-11 months",emoji:"🫙"},
  ],
};
const AGE_ORDER = ["6-8 months","9-11 months","12-14 months","15-18 months","19-24 months","2-3 years","3-4 years"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MEALS = ["Breakfast","Lunch","Dinner"];
const MEAL_EMOJIS = {Breakfast:"🌅",Lunch:"☀️",Dinner:"🌙"};
const TAGS = [
  {id:"favourite",label:"❤️ Favourite",color:"#F72585"},
  {id:"makeagain",label:"🔄 Make Again",color:"#06D6A0"},
  {id:"tweak",label:"🔧 Needs Tweaking",color:"#F59E0B"},
  {id:"quick",label:"⚡ Quick & Easy",color:"#4361EE"},
  {id:"rejected",label:"😣 Rejected",color:"#EF4444"},
  {id:"batch",label:"🧊 Batch Cook",color:"#9B5DE5"},
];
const REACTIONS = [
  {value:"loved",label:"Loved it!",emoji:"😍",color:"#06D6A0"},
  {value:"ok",label:"Accepted",emoji:"😊",color:"#4361EE"},
  {value:"rejected",label:"Rejected",emoji:"😣",color:"#F59E0B"},
  {value:"allergic",label:"Reaction!",emoji:"⚠️",color:"#EF4444"},
];
const QUICK_Q = ["My baby refuses to eat!","Can I freeze baby food?","What foods to introduce next?","My baby is constipated!","How to add more nutrition?","Baby only eats sweet food!"];

function isAgeOk(min,cur){return AGE_ORDER.indexOf(cur)>=AGE_ORDER.indexOf(min);}
function daysSince(d){return Math.floor((Date.now()-new Date(d).getTime())/864e5);}

export default function BabyFoodApp(){
  const [mode,setMode]=useState("home");
  const [language,setLanguage]=useState("English");
  const [babyAge,setBabyAge]=useState("9-11 months");
  const [babyName,setBabyName]=useState("");
  const [toast,setToast]=useState("");

  // Recipe
  const [recipeStep,setRecipeStep]=useState(1);
  const [method,setMethod]=useState(null);
  const [allergens,setAllergens]=useState([]);
  const [fridgeInput,setFridgeInput]=useState("");
  const [fridgeImage,setFridgeImage]=useState(null);
  const [fridgeImageUrl,setFridgeImageUrl]=useState(null);
  const [recipeList,setRecipeList]=useState([]);
  const [selectedRecipe,setSelectedRecipe]=useState(null);
  const [loadingList,setLoadingList]=useState(false);
  const [loadingDetail,setLoadingDetail]=useState(false);
  const [saving,setSaving]=useState(false);

  // Cookbook
  const [savedRecipes,setSavedRecipes]=useState([]);
  const [ratings,setRatings]=useState({});
  const [cookbookSelected,setCookbookSelected]=useState(null);
  const [showRatingModal,setShowRatingModal]=useState(null);
  const [ratingStars,setRatingStars]=useState(0);
  const [ratingNote,setRatingNote]=useState("");
  const [ratingTags,setRatingTags]=useState([]);
  const [cbSearch,setCbSearch]=useState("");
  const [cbSort,setCbSort]=useState("newest");
  const [cbFilterTag,setCbFilterTag]=useState(null);

  // Tracker
  const [trackerLog,setTrackerLog]=useState({});
  const [customFoods,setCustomFoods]=useState({});
  const [trackerView,setTrackerView]=useState("foods");
  const [activeCat,setActiveCat]=useState("🥕 Vegetables");
  const [trackerSearch,setTrackerSearch]=useState("");
  const [selectedFood,setSelectedFood]=useState(null);
  const [logDate,setLogDate]=useState(new Date().toISOString().split("T")[0]);
  const [logReaction,setLogReaction]=useState(null);
  const [logNotes,setLogNotes]=useState("");
  const [showAddCustom,setShowAddCustom]=useState(false);
  const [customFoodName,setCustomFoodName]=useState("");
  const [customFoodCat,setCustomFoodCat]=useState("🥕 Vegetables");

  // Planner
  const [plan,setPlan]=useState({});
  const [shoppingList,setShoppingList]=useState([]);
  const [checkedItems,setCheckedItems]=useState({});
  const [plannerView,setPlannerView]=useState("plan");
  const [activeDay,setActiveDay]=useState("Monday");
  const [loadingPlan,setLoadingPlan]=useState(false);
  const [showSlotPicker,setShowSlotPicker]=useState(null);
  const [showCustomMeal,setShowCustomMeal]=useState(null);
  const [customMealName,setCustomMealName]=useState("");

  // Chat
  const [messages,setMessages]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const [chatImage,setChatImage]=useState(null);
  const [chatImageUrl,setChatImageUrl]=useState(null);
  const bottomRef=useRef(null);
  const fileRef=useRef(null);
  const chatFileRef=useRef(null);

  useEffect(()=>{loadAll();},[]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,chatLoading]);

  async function loadAll(){
    try{
      const s=storage.get(SK.settings);
      if(s){const d=s;if(d.language)setLanguage(d.language);if(d.babyAge)setBabyAge(d.babyAge);if(d.babyName)setBabyName(d.babyName);}
      const cb=storage.get(SK.cookbook);if(cb)setSavedRecipes(cb);
      const tr=storage.get(SK.tracker);if(tr){if(tr.log)setTrackerLog(tr.log);if(tr.customFoods)setCustomFoods(tr.customFoods);}
      const pl=storage.get(SK.planner);if(pl){if(pl.plan)setPlan(pl.plan);if(pl.shoppingList)setShoppingList(pl.shoppingList);if(pl.checkedItems)setCheckedItems(pl.checkedItems);}
      const rt=storage.get(SK.ratings);if(rt)setRatings(rt);
    }catch(e){}
  }

  function saveSettings(u={}){storage.set(SK.settings,{language,babyAge,babyName,...u});}
  function saveCookbook(d){storage.set(SK.cookbook,d);}
  function saveTracker(u={}){storage.set(SK.tracker,{log:trackerLog,customFoods,...u});}
  function savePlanner(u={}){storage.set(SK.planner,{plan,shoppingList,checkedItems,...u});}
  function saveRatingsStore(d){storage.set(SK.ratings,d);}

  function showT(msg){setToast(msg);setTimeout(()=>setToast(""),3000);}
  function handleLang(l){setLanguage(l);saveSettings({language:l});}
  function handleAge(a){setBabyAge(a);saveSettings({babyAge:a});}
  function goHome(){setMode("home");setRecipeStep(1);setSelectedRecipe(null);setRecipeList([]);}

  function handleFridgeImg(e){const f=e.target.files[0];if(!f)return;setFridgeImageUrl(URL.createObjectURL(f));const r=new FileReader();r.onload=()=>setFridgeImage({base64:r.result.split(",")[1],type:f.type});r.readAsDataURL(f);}
  function handleChatImg(e){const f=e.target.files[0];if(!f)return;setChatImageUrl(URL.createObjectURL(f));const r=new FileReader();r.onload=()=>setChatImage({base64:r.result.split(",")[1],type:f.type});r.readAsDataURL(f);}

  // ── RECIPE ──
  async function generateRecipeList(){
    if(!method)return;
    setLoadingList(true);setRecipeList([]);setSelectedRecipe(null);setRecipeStep(4);
    const ai=AGES.find(a=>a.value===babyAge);
    const aText=allergens.length>0?`STRICTLY avoid: ${allergens.join(", ")}.`:"";
    const mText=method==="Thermomix TM6"?"Thermomix TM6 with settings like [Speed 5/100°C/5min].":method==="no-cook"?"No cooking.":`${method}.`;
    const fText=fridgeInput.trim()?`Use if safe: ${fridgeInput}.`:fridgeImage?"User uploaded fridge photo.":"Use common ingredients.";
    const prompt=`Expert baby food nutritionist. Generate EXACTLY 5 baby food recipe options for ${babyAge} baby. Respond in ${language}.
Texture: ${ai.texture}. Method: ${mText} ${aText} ${fText}
No honey under 12mo. No whole nuts under 4yr. No salt/sugar under 12mo.
ONLY valid JSON array, no backticks:
[{"id":1,"name":"Name","description":"One sentence","prepTime":"X min","cookTime":"X min","difficulty":"Easy or Medium","mainIngredients":["item1","item2","item3"],"highlight":"Unique feature"}]`;
    try{
      const mc=fridgeImage?[{type:"image",source:{type:"base64",media_type:fridgeImage.type,data:fridgeImage.base64}},{type:"text",text:prompt}]:prompt;
      const res=await callClaude(typeof mc==="string"?mc:JSON.stringify(mc));
      setRecipeList(JSON.parse(res.replace(/```json|```/g,"").trim()));
    }catch(e){showT("Could not generate. Try again.");setRecipeStep(2);}
    finally{setLoadingList(false);}
  }

  async function getRecipeDetail(recipe){
    setLoadingDetail(true);setSelectedRecipe({...recipe,loading:true});
    const ai=AGES.find(a=>a.value===babyAge);
    const aText=allergens.length>0?`STRICTLY avoid: ${allergens.join(", ")}.`:"";
    const mText=method==="Thermomix TM6"?"Use Thermomix TM6 with exact settings like [Speed 5/100°C/5min].":method==="no-cook"?"No cooking.":`Use ${method}.`;
    const prompt=`Expert baby food nutritionist. Full recipe for "${recipe.name}" for ${babyAge} baby. Respond in ${language}.
Texture: ${ai.texture}. Method: ${mText} ${aText}
No honey under 12mo. No whole nuts under 4yr. No salt/sugar under 12mo.
ONLY valid JSON, no backticks:
{"name":"${recipe.name}","description":"${recipe.description}","ageNote":"Why perfect for ${babyAge}","prepTime":"${recipe.prepTime}","cookTime":"${recipe.cookTime}","servings":"X portions","difficulty":"${recipe.difficulty}","ingredients":["50g item"],"steps":["Step"],"nutrition":{"calories":"X kcal","protein":"X g","iron":"X mg","calcium":"X mg"},"tip":"Parent tip","storageNote":"Storage info","nextFoods":["Food1","Food2","Food3"]}`;
    try{const res=await callClaude(prompt);setSelectedRecipe(JSON.parse(res.replace(/```json|```/g,"").trim()));}
    catch(e){setSelectedRecipe(null);showT("Could not load recipe.");}
    finally{setLoadingDetail(false);}
  }

  async function saveRecipe(){
    if(!selectedRecipe)return;setSaving(true);
    const ts={...selectedRecipe,id:Date.now(),savedAt:new Date().toLocaleDateString("en-MY",{day:"numeric",month:"short",year:"numeric"}),babyAge};
    const u=[ts,...savedRecipes];setSavedRecipes(u);await saveCookbook(u);setSaving(false);showT("Saved to cookbook! 📖");
  }

  async function deleteRecipe(id){
    const u=savedRecipes.filter(r=>r.id!==id);setSavedRecipes(u);await saveCookbook(u);setCookbookSelected(null);showT("Recipe removed.");
  }

  // ── RATINGS ──
  function openRatingModal(recipe){const ex=ratings[recipe.id]||{};setRatingStars(ex.stars||0);setRatingNote(ex.note||"");setRatingTags(ex.tags||[]);setShowRatingModal(recipe);}
  async function saveRating(){
    if(!showRatingModal)return;
    const u={...ratings,[showRatingModal.id]:{stars:ratingStars,note:ratingNote,tags:ratingTags,ratedAt:new Date().toISOString()}};
    setRatings(u);await saveRatingsStore(u);setShowRatingModal(null);showT("Rating saved! ⭐");
  }

  // ── TRACKER ──
  function getAllFoods(){const a={};Object.entries(FOOD_LIBRARY).forEach(([c,f])=>{a[c]=[...f];});Object.entries(customFoods).forEach(([c,f])=>{if(!a[c])a[c]=[];a[c]=[...a[c],...f];});return a;}
  function getStatus(n){const e=trackerLog[n];if(!e)return"not_tried";if(e.reaction==="allergic")return"allergic";if(daysSince(e.date)<3)return"waiting";return e.reaction==="rejected"?"rejected":"safe";}
  function getStatusStyle(s){const m={not_tried:{bg:"#f5f5f5",color:"#aaa",border:"#eee",label:"Not tried"},waiting:{bg:"#FFF9E6",color:C.amber,border:C.amber,label:"Waiting 3 days"},safe:{bg:`${C.green}15`,color:C.green,border:C.green,label:"✅ Safe"},rejected:{bg:`${C.orange}15`,color:C.orange,border:C.orange,label:"😣 Rejected"},allergic:{bg:`${C.red}15`,color:C.red,border:C.red,label:"⚠️ Reaction"}};return m[s]||m.not_tried;}
  function openLogFood(food){setSelectedFood(food);setLogDate(new Date().toISOString().split("T")[0]);setLogReaction(trackerLog[food.name]?.reaction||null);setLogNotes(trackerLog[food.name]?.notes||"");}
  async function saveLog(){if(!logReaction)return;const l={...trackerLog,[selectedFood.name]:{date:logDate,reaction:logReaction,notes:logNotes,emoji:selectedFood.emoji}};setTrackerLog(l);await saveTracker({log:l});setSelectedFood(null);showT(`${selectedFood.name} logged! 📝`);}
  async function removeLog(n){const l={...trackerLog};delete l[n];setTrackerLog(l);await saveTracker({log:l});showT("Removed.");}
  async function addCustomFood(){if(!customFoodName.trim())return;const nf={name:customFoodName.trim(),emoji:"🍽",minAge:babyAge,custom:true};const u={...customFoods};if(!u[customFoodCat])u[customFoodCat]=[];u[customFoodCat]=[...u[customFoodCat],nf];setCustomFoods(u);await saveTracker({customFoods:u});setCustomFoodName("");setShowAddCustom(false);showT(`${nf.name} added!`);}

  // ── PLANNER ──
  function genShoppingList(p){const m={};Object.values(p).forEach(d=>{Object.values(d).forEach(meal=>{if(meal?.ingredients)meal.ingredients.forEach(i=>{const k=i.toLowerCase().trim();m[k]=(m[k]||0)+1;});});});return Object.entries(m).map(([n,c])=>({name:n.charAt(0).toUpperCase()+n.slice(1),count:c,id:n})).sort((a,b)=>b.count-a.count);}
  async function generateWeekPlan(){
    setLoadingPlan(true);
    const prompt=`Expert baby food nutritionist. Complete 7-day meal plan for ${babyAge} baby. Respond in ${language}.
Each day: Breakfast, Lunch, Dinner. Varied, nutritious. No honey/salt/sugar under 12mo. No whole nuts under 4yr.
ONLY valid JSON, no backticks:
{"Monday":{"Breakfast":{"name":"meal","ingredients":["item"],"portions":"X portions"},"Lunch":{"name":"meal","ingredients":["item"],"portions":"X portions"},"Dinner":{"name":"meal","ingredients":["item"],"portions":"X portions"}},"Tuesday":{},"Wednesday":{},"Thursday":{},"Friday":{},"Saturday":{},"Sunday":{}}`;
    try{const res=await callClaude(prompt);const np=JSON.parse(res.replace(/```json|```/g,"").trim());const sl=genShoppingList(np);setPlan(np);setShoppingList(sl);setCheckedItems({});await savePlanner({plan:np,shoppingList:sl,checkedItems:{}});showT("Weekly plan ready! 🎉");}
    catch(e){showT("Could not generate plan.");}
    finally{setLoadingPlan(false);}
  }
  async function addMealFromCookbook(recipe,day,meal){const np={...plan,[day]:{...(plan[day]||{}),[meal]:{name:recipe.name,ingredients:recipe.ingredients||[],portions:recipe.servings||"1 portion",fromCookbook:true}}};const sl=genShoppingList(np);setPlan(np);setShoppingList(sl);await savePlanner({plan:np,shoppingList:sl});setShowSlotPicker(null);showT(`${recipe.name} added!`);}
  async function addCustomMealSlot(day,meal){if(!customMealName.trim())return;const np={...plan,[day]:{...(plan[day]||{}),[meal]:{name:customMealName.trim(),ingredients:[],portions:"1 portion",custom:true}}};setPlan(np);await savePlanner({plan:np});setShowCustomMeal(null);setCustomMealName("");showT(`${customMealName} added!`);}
  async function removeMealSlot(day,meal){const np={...plan};if(np[day]){delete np[day][meal];if(!Object.keys(np[day]).length)delete np[day];}const sl=genShoppingList(np);setPlan(np);setShoppingList(sl);await savePlanner({plan:np,shoppingList:sl});}
  function toggleCheck(id){const u={...checkedItems,[id]:!checkedItems[id]};setCheckedItems(u);savePlanner({checkedItems:u});}

  // ── CHAT ──
  async function sendChatMessage(ov){
    const text=ov||chatInput.trim();if((!text&&!chatImage)||chatLoading)return;
    const uc=chatImage?`📷 [Photo] ${text||"What can I make?"}`:text;
    const upd=[...messages,{role:"user",content:uc}];setMessages(upd);setChatInput("");setChatLoading(true);
    const hist=upd.map(m=>`${m.role==="user"?"Parent":"Assistant"}: ${m.content}`).join("\n\n");
    const prompt=`Warm expert baby food nutritionist. Baby is ${babyAge}${babyName?`, name is ${babyName}`:""}.
Respond in ${language}. Help with recipes, feeding problems, nutrition, meal planning. Be warm and reassuring.
${chatImage?"Parent uploaded photo. Suggest safe age-appropriate ideas.":""}
No honey under 12mo. No whole nuts under 4yr. No salt/sugar under 12mo.
--- Conversation ---\n${hist}\n--- End ---\nReply as Assistant:`;
    try{
      const mc=chatImage?[{type:"image",source:{type:"base64",media_type:chatImage.type,data:chatImage.base64}},{type:"text",text:prompt}]:prompt;
      const res=await callClaude(typeof mc==="string"?mc:JSON.stringify(mc));
      setMessages(p=>[...p,{role:"assistant",content:res}]);setChatImage(null);setChatImageUrl(null);
    }catch(e){setMessages(p=>[...p,{role:"assistant",content:"Sorry, something went wrong!"}]);}
    finally{setChatLoading(false);}
  }

  // ── STATS ──
  const allFoods=getAllFoods();
  const appropriateFoods=Object.values(allFoods).flat().filter(f=>isAgeOk(f.minAge,babyAge));
  const triedCount=Object.keys(trackerLog).length;
  const safeCount=Object.entries(trackerLog).filter(([k,v])=>v.reaction!=="allergic"&&daysSince(v.date)>=3).length;
  const allergicCount=Object.entries(trackerLog).filter(([k,v])=>v.reaction==="allergic").length;
  const waitingCount=Object.entries(trackerLog).filter(([k,v])=>daysSince(v.date)<3).length;
  const progressPct=appropriateFoods.length>0?Math.round((safeCount/appropriateFoods.length)*100):0;
  const totalMeals=Object.values(plan).reduce((a,d)=>a+Object.keys(d||{}).length,0);
  const completeDays=Object.values(plan).filter(d=>d&&Object.keys(d).length===3).length;
  const checkedCount=Object.values(checkedItems).filter(Boolean).length;
  const ratedCount=savedRecipes.filter(r=>ratings[r.id]?.stars).length;
  const favCount=savedRecipes.filter(r=>(ratings[r.id]?.tags||[]).includes("favourite")).length;

  // ── SHARED UI ──
  function LangSelect(){return(<select value={language} onChange={e=>handleLang(e.target.value)} style={{padding:"5px 8px",borderRadius:16,border:"none",background:"rgba(255,255,255,0.2)",color:"white",fontSize:11,cursor:"pointer",outline:"none"}}>{LANGUAGES.map(l=><option key={l.code} value={l.code} style={{background:C.dark}}>{l.label}</option>)}</select>);}
  function AgeBar(){return(<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>{AGES.map(a=>(<button key={a.value} onClick={()=>handleAge(a.value)} style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${babyAge===a.value?"white":"rgba(255,255,255,0.3)"}`,background:babyAge===a.value?"white":"transparent",color:babyAge===a.value?C.purple:"white",fontSize:11,cursor:"pointer",flexShrink:0,fontWeight:babyAge===a.value?700:400}}>{a.emoji} {a.label}</button>))}</div>);}

  function FullRecipeCard({r,onSave,showSave=true}){
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.orange},${C.yellow})`,borderRadius:20,padding:"20px",marginBottom:14,boxShadow:`0 4px 16px ${C.orange}44`}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>{r.babyAge||babyAge}</div>
        <h2 style={{color:"white",fontFamily:"Georgia",fontSize:"1.2rem",margin:"0 0 6px"}}>{r.name}</h2>
        <p style={{color:"rgba(255,255,255,0.9)",fontSize:13,margin:"0 0 12px",lineHeight:1.5}}>{r.description}</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[{l:"⏱",v:r.prepTime},{l:"🔥",v:r.cookTime},{l:"🍽",v:r.servings},{l:"📊",v:r.difficulty}].map((b,i)=>(<span key={i} style={{background:"rgba(255,255,255,0.25)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"white"}}>{b.l} {b.v}</span>))}
        </div>
      </div>
      {r.ageNote&&<div style={{background:`${C.green}18`,border:`1px solid ${C.green}44`,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:13,color:C.dark}}><strong style={{color:C.green}}>✅ </strong>{r.ageNote}</div>}
      <div style={{background:"white",borderRadius:14,padding:"14px",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{fontSize:11,color:C.purple,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Nutrition per serving</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {[{l:"Calories",v:r.nutrition?.calories,c:C.orange},{l:"Protein",v:r.nutrition?.protein,c:C.green},{l:"Iron",v:r.nutrition?.iron,c:C.pink},{l:"Calcium",v:r.nutrition?.calcium,c:C.purple}].map((n,i)=>(<div key={i} style={{textAlign:"center",background:`${n.c}11`,borderRadius:10,padding:"8px 4px"}}><div style={{fontSize:11,fontWeight:700,color:n.c}}>{n.v}</div><div style={{fontSize:10,color:"#aaa",marginTop:2}}>{n.l}</div></div>))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div style={{background:"white",borderRadius:14,padding:"14px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:11,color:C.orange,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Ingredients</div>
          {r.ingredients?.map((ing,i)=>(<div key={i} style={{fontSize:12,color:C.dark,marginBottom:5,display:"flex",gap:6}}><span style={{color:C.orange}}>•</span><span>{ing}</span></div>))}
        </div>
        <div style={{background:"white",borderRadius:14,padding:"14px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:11,color:C.purple,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Method</div>
          {r.steps?.map((s,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:7}}><div style={{width:18,height:18,borderRadius:"50%",background:C.purple,color:"white",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div><p style={{fontSize:12,color:C.dark,margin:0,lineHeight:1.5}}>{s}</p></div>))}
        </div>
      </div>
      {r.tip&&<div style={{background:`${C.yellow}33`,border:`1px solid ${C.yellow}`,borderRadius:12,padding:"12px 14px",marginBottom:10,fontSize:13,color:C.dark}}><strong style={{color:C.orange}}>💡 </strong>{r.tip}</div>}
      {r.storageNote&&<div style={{background:`${C.blue}11`,border:`1px solid ${C.blue}33`,borderRadius:12,padding:"12px 14px",marginBottom:10,fontSize:13,color:C.dark}}><strong style={{color:C.blue}}>🧊 </strong>{r.storageNote}</div>}
      {r.nextFoods&&<div style={{background:`${C.green}12`,border:`1px solid ${C.green}33`,borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:13,color:C.dark}}><strong style={{color:C.green}}>🌱 Try next: </strong><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{r.nextFoods.map((f,i)=>(<span key={i} style={{background:`${C.green}22`,color:C.green,borderRadius:20,padding:"3px 10px",fontSize:12}}>{f}</span>))}</div></div>}
      {showSave&&onSave&&<button onClick={onSave} disabled={saving} style={{width:"100%",padding:"13px",background:saving?"#ccc":`linear-gradient(135deg,${C.green},${C.blue})`,color:"white",border:"none",borderRadius:14,fontSize:14,fontWeight:600,cursor:saving?"not-allowed":"pointer",marginBottom:10}}>{saving?"Saving…":"💾 Save to Cookbook"}</button>}
    </div>);
  }

  function RatingModal(){
    if(!showRatingModal)return null;
    return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:100}}>
      <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:500,margin:"0 auto",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h3 style={{color:C.dark,fontSize:"1rem",margin:0}}>Rate: {showRatingModal.name}</h3><button onClick={()=>setShowRatingModal(null)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#aaa"}}>✕</button></div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:13,color:"#7a7a8a",marginBottom:10}}>How many stars?</div>
          <div style={{display:"flex",justifyContent:"center",gap:12}}>{[1,2,3].map(i=>(<span key={i} onClick={()=>setRatingStars(i)} style={{fontSize:44,cursor:"pointer",opacity:i<=ratingStars?1:0.2,filter:i<=ratingStars?"none":"grayscale(100%)"}} >⭐</span>))}</div>
          <div style={{fontSize:12,color:C.orange,marginTop:6,fontWeight:600}}>{ratingStars===1?"Needs improvement":ratingStars===2?"Pretty good!":ratingStars===3?"Amazing! 🎉":"Tap to rate"}</div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:13,color:"#7a7a8a",marginBottom:10}}>Tags (optional)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{TAGS.map(tag=>(<div key={tag.id} onClick={()=>setRatingTags(p=>p.includes(tag.id)?p.filter(t=>t!==tag.id):[...p,tag.id])} style={{background:ratingTags.includes(tag.id)?`${tag.color}20`:"#f9f9f9",border:`1.5px solid ${ratingTags.includes(tag.id)?tag.color:"#eee"}`,borderRadius:12,padding:"10px",cursor:"pointer",fontSize:12,fontWeight:ratingTags.includes(tag.id)?600:400,color:ratingTags.includes(tag.id)?tag.color:C.dark,textAlign:"center"}}>{tag.label}</div>))}</div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,color:"#7a7a8a",marginBottom:8}}>Personal note</div>
          <textarea value={ratingNote} onChange={e=>setRatingNote(e.target.value)} placeholder="e.g. added less water, baby loved it warm…" rows={3} style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:13,fontFamily:"sans-serif",resize:"none",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <button onClick={()=>setShowRatingModal(null)} style={{padding:"13px",background:"white",border:`1.5px solid ${C.light}`,borderRadius:14,fontSize:14,cursor:"pointer",color:C.dark}}>Cancel</button>
          <button onClick={saveRating} disabled={ratingStars===0} style={{padding:"13px",background:ratingStars===0?"#ccc":`linear-gradient(135deg,${C.orange},${C.pink})`,color:"white",border:"none",borderRadius:14,fontSize:14,fontWeight:600,cursor:ratingStars===0?"not-allowed":"pointer"}}>Save ⭐</button>
        </div>
      </div>
    </div>);
  }

  function Toast(){return toast?<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:C.dark,color:"white",padding:"10px 20px",borderRadius:20,fontSize:13,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",whiteSpace:"nowrap",zIndex:999}}>{toast}</div>:null;}
  function BottomNav(){if(mode==="home")return null;return(<div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #f0e8d8",padding:"8px 16px 12px",display:"flex",justifyContent:"space-around",zIndex:50,boxShadow:"0 -2px 12px rgba(0,0,0,0.06)"}}>{[{id:"home",icon:"🏠",label:"Home"},{id:"recipe",icon:"🍽",label:"Recipe"},{id:"chat",icon:"💬",label:"Chat"},{id:"cookbook",icon:"📖",label:"Book"},{id:"tracker",icon:"🥕",label:"Tracker"},{id:"planner",icon:"📅",label:"Planner"},{id:"shopping",icon:"🛒",label:"Shopping"}].map(item=>(<button key={item.id} onClick={()=>{if(item.id==="home")goHome();else if(item.id==="shopping"){setMode("planner");setPlannerView("shopping");}else{setMode(item.id);if(item.id==="chat"&&messages.length===0)setMessages([{role:"assistant",content:"Hello! How can I help? 👶"}]);}}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"4px 6px",borderRadius:10,background:(item.id==="shopping"?mode==="planner"&&plannerView==="shopping":mode===item.id)??`${C.orange}15`:"none"}}><span style={{fontSize:18}}>{item.icon}</span><span style={{fontSize:9,color:mode===item.id?C.orange:"#aaa",fontWeight:mode===item.id?700:400}}>{item.label}</span></button>))}</div>);}

  // ── HOME ──
  if(mode==="home")return(
    <div style={{fontFamily:"sans-serif",background:C.cream,minHeight:"100vh",paddingBottom:70}}>
      <div style={{background:`linear-gradient(135deg,${C.orange},${C.pink})`,padding:"28px 20px 20px",textAlign:"center",position:"relative"}}>
        <div style={{fontSize:48,marginBottom:6}}>👶🍼</div>
        <h1 style={{color:"white",fontFamily:"Georgia",fontSize:"1.7rem",margin:"0 0 4px"}}>Baby Food Assistant</h1>
        <p style={{color:"rgba(255,255,255,0.85)",fontSize:13,margin:"0 0 14px"}}>Safe · Nutritious · Made with love</p>
        <AgeBar/>
        <div style={{position:"absolute",top:14,right:16}}><LangSelect/></div>
        {babyName&&<div style={{marginTop:6,fontSize:12,color:"rgba(255,255,255,0.7)"}}>Tracking for: {babyName}</div>}
      </div>
      <div style={{padding:"20px 16px",maxWidth:500,margin:"0 auto"}}>
        {[
          {id:"recipe",icon:"🍽",title:"Quick Recipe",desc:"5 recipe options tailored to baby's age, method & allergens",grad:`linear-gradient(135deg,${C.orange},${C.yellow})`},
          {id:"chat",icon:"💬",title:"Chat with Baby Chef",desc:"Ask anything — fridge photos, feeding problems, nutrition",grad:`linear-gradient(135deg,${C.purple},${C.blue})`},
          {id:"cookbook",icon:"📖",title:"My Cookbook",desc:`${savedRecipes.length} saved · ${favCount} ❤️ · ${ratedCount} rated`,grad:`linear-gradient(135deg,${C.green},${C.blue})`},
          {id:"tracker",icon:"🥕",title:"Food Tracker",desc:`${safeCount} safe · ${triedCount} tried · ${progressPct}% complete`,grad:`linear-gradient(135deg,${C.amber},${C.orange})`},
          {id:"planner",icon:"📅",title:"Meal Planner",desc:`${totalMeals}/21 meals · ${completeDays}/7 days complete`,grad:`linear-gradient(135deg,${C.purple},${C.pink})`},
        ].map(item=>(
          <div key={item.id} onClick={()=>{setMode(item.id);if(item.id==="chat"&&messages.length===0)setMessages([{role:"assistant",content:`Hello! I'm your baby food assistant 👶 ${babyName?`Here to help with ${babyName}'s meals!`:"How old is your baby? I can help with recipes, feeding problems and nutrition!"}`}]);}}
            style={{background:"white",borderRadius:20,padding:"16px",marginBottom:10,boxShadow:"0 4px 16px rgba(0,0,0,0.08)",cursor:"pointer",border:`2px solid ${C.light}`,display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:52,height:52,borderRadius:16,background:item.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{item.icon}</div>
            <div style={{flex:1}}><div style={{fontWeight:700,color:C.dark,fontSize:15,marginBottom:2}}>{item.title}</div><div style={{fontSize:12,color:"#7a7a8a",lineHeight:1.4}}>{item.desc}</div></div>
            <span style={{color:C.orange,fontSize:20}}>›</span>
          </div>
        ))}
        <div style={{background:`${C.green}15`,borderRadius:16,padding:"14px",border:`1px solid ${C.green}33`,marginTop:4}}>
          <div style={{fontSize:12,color:C.green,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>💡 Did you know?</div>
          {["Introduce one new food at a time, wait 3 days before the next","Babies need iron-rich foods from 6 months onwards","It takes 10-15 tries before a baby accepts a new food!"].map((tip,i)=>(<div key={i} style={{fontSize:13,color:C.dark,marginBottom:5,display:"flex",gap:8}}><span style={{color:C.green}}>•</span><span>{tip}</span></div>))}
        </div>
      </div>
      <Toast/><BottomNav/>
    </div>
  );

  // ── RECIPE ──
  if(mode==="recipe")return(
    <div style={{fontFamily:"sans-serif",background:C.cream,minHeight:"100vh",paddingBottom:70}}>
      <div style={{background:`linear-gradient(135deg,${C.orange},${C.pink})`,padding:"14px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <button onClick={()=>{if(recipeStep>1&&!loadingList)setRecipeStep(s=>s-1);else goHome();}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>← {recipeStep===1?"Home":"Back"}</button>
          <div style={{flex:1}}><div style={{color:"white",fontWeight:600,fontSize:15}}>🍽 Quick Recipe</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>Step {Math.min(recipeStep,4)} of 4</div></div>
          <LangSelect/>
        </div>
        <AgeBar/>
      </div>
      <div style={{background:"white",padding:"10px 20px",display:"flex",gap:6,alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        {["👶","🍳","🥜","🍽"].map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,flex:1}}><div onClick={()=>{if(recipeStep>i+1&&!loadingList)setRecipeStep(i+1);}} style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,cursor:recipeStep>i+1?"pointer":"default",background:recipeStep>i+1?C.green:recipeStep===i+1?C.orange:"#eee",color:recipeStep>=i+1?"white":"#aaa"}}>{recipeStep>i+1?"✓":s}</div>{i<3&&<div style={{flex:1,height:2,background:recipeStep>i+1?C.green:"#eee",borderRadius:2}}/>}</div>))}
      </div>
      <div style={{padding:"20px 16px",maxWidth:600,margin:"0 auto"}}>
        {recipeStep===1&&(<div>
          <h2 style={{color:C.dark,fontSize:"1.1rem",marginBottom:4}}>How will you cook it? 🍳</h2>
          <p style={{color:"#7a7a8a",fontSize:13,marginBottom:16}}>We'll tailor the steps to your equipment</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {METHODS.map(m=>(<div key={m.value} onClick={()=>setMethod(m.value)} style={{background:method===m.value?C.purple:"white",borderRadius:16,padding:"16px 12px",textAlign:"center",cursor:"pointer",border:`2px solid ${method===m.value?C.purple:C.light}`,transition:"all 0.2s",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}><div style={{fontSize:28,marginBottom:6}}>{m.emoji}</div><div style={{fontWeight:600,color:method===m.value?"white":C.dark,fontSize:14}}>{m.label}</div></div>))}
          </div>
          {method&&<button onClick={()=>setRecipeStep(2)} style={{width:"100%",marginTop:16,padding:"14px",background:`linear-gradient(135deg,${C.purple},${C.blue})`,color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer"}}>Next → Allergens</button>}
        </div>)}
        {recipeStep===2&&(<div>
          <h2 style={{color:C.dark,fontSize:"1.1rem",marginBottom:4}}>Allergens & Ingredients 🥜</h2>
          <p style={{color:"#7a7a8a",fontSize:13,marginBottom:10}}>Any allergens to avoid?</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {ALLERGENS.map(a=>(<div key={a.value} onClick={()=>setAllergens(p=>p.includes(a.value)?p.filter(x=>x!==a.value):[...p,a.value])} style={{background:allergens.includes(a.value)?C.yellow:"white",borderRadius:12,padding:"10px 12px",cursor:"pointer",border:`2px solid ${allergens.includes(a.value)?C.orange:C.light}`,fontSize:13,fontWeight:allergens.includes(a.value)?600:400,color:C.dark,textAlign:"center",transition:"all 0.2s"}}>{a.label}</div>))}
          </div>
          <p style={{color:"#7a7a8a",fontSize:13,marginBottom:8}}>What's in your fridge? <span style={{color:"#bbb"}}>(optional)</span></p>
          <textarea value={fridgeInput} onChange={e=>setFridgeInput(e.target.value)} placeholder="e.g. sweet potato, chicken, carrot…" rows={2} style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:13,fontFamily:"sans-serif",resize:"none",outline:"none",background:"white",color:C.dark,boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <button onClick={()=>fileRef.current.click()} style={{flex:1,padding:"10px",background:fridgeImageUrl?C.green:"white",border:`1.5px solid ${fridgeImageUrl?C.green:C.light}`,borderRadius:12,fontSize:13,cursor:"pointer",color:fridgeImageUrl?"white":C.dark}}>{fridgeImageUrl?"✅ Photo added":"📷 Fridge photo"}</button>
            {fridgeImageUrl&&<button onClick={()=>{setFridgeImage(null);setFridgeImageUrl(null);}} style={{padding:"10px 14px",background:"white",border:`1.5px solid ${C.light}`,borderRadius:12,fontSize:13,cursor:"pointer",color:"#aaa"}}>✕</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFridgeImg} style={{display:"none"}}/>
          <div style={{background:"white",borderRadius:14,padding:"14px",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:11,color:"#aaa",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Your selection</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              <span onClick={()=>setRecipeStep(1)} style={{background:`${C.purple}22`,color:C.purple,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{METHODS.find(m=>m.value===method)?.emoji} {METHODS.find(m=>m.value===method)?.label} ✏️</span>
              {allergens.map(a=>(<span key={a} style={{background:`${C.yellow}66`,color:C.dark,borderRadius:20,padding:"4px 12px",fontSize:12}}>No {a}</span>))}
            </div>
          </div>
          <button onClick={generateRecipeList} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${C.green},${C.blue})`,color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer"}}>✨ Show Me 5 Recipes!</button>
        </div>)}
        {recipeStep===4&&(<div>
          {loadingList&&(<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:50,marginBottom:16}}>👨‍🍳</div><div style={{fontSize:16,color:C.dark,fontWeight:600,marginBottom:8}}>Finding 5 options…</div><div style={{display:"flex",justifyContent:"center",gap:6,marginTop:20}}>{[0,1,2].map(i=>(<div key={i} style={{width:10,height:10,borderRadius:"50%",background:C.orange,animation:"bounce 1s infinite",animationDelay:`${i*0.2}s`}}/>))}</div></div>)}
          {!loadingList&&!selectedRecipe&&recipeList.length>0&&(<div>
            <h2 style={{color:C.dark,fontSize:"1.1rem",marginBottom:4}}>Choose a recipe! 🍽</h2>
            <p style={{color:"#7a7a8a",fontSize:13,marginBottom:14}}>Tap any card to see full details</p>
            {recipeList.map((r,i)=>(<div key={r.id} onClick={()=>getRecipeDetail(r)} style={{background:CARD_COLORS[i].bg,borderRadius:18,padding:"18px",marginBottom:12,cursor:"pointer",boxShadow:`0 4px 16px ${CARD_COLORS[i].s}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1}}><div style={{color:"rgba(255,255,255,0.7)",fontSize:11,marginBottom:4}}>Option {i+1}</div><div style={{color:"white",fontFamily:"Georgia",fontSize:"1.1rem",fontWeight:700,marginBottom:4}}>{r.name}</div><div style={{color:"rgba(255,255,255,0.9)",fontSize:12,lineHeight:1.5}}>{r.description}</div></div>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:18,flexShrink:0,marginLeft:12}}>›</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>{[{l:"⏱",v:r.prepTime},{l:"🔥",v:r.cookTime},{l:"📊",v:r.difficulty}].map((b,j)=>(<span key={j} style={{background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"3px 10px",fontSize:11,color:"white"}}>{b.l} {b.v}</span>))}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{r.mainIngredients?.map((ing,j)=>(<span key={j} style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"2px 8px",fontSize:11,color:"white"}}>{ing}</span>))}</div>
              {r.highlight&&<div style={{marginTop:10,background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"6px 10px",fontSize:11,color:"white"}}>✨ {r.highlight}</div>}
            </div>))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
              <button onClick={()=>{setRecipeList([]);setSelectedRecipe(null);setRecipeStep(2);}} style={{padding:"13px",background:`linear-gradient(135deg,${C.orange},${C.pink})`,color:"white",border:"none",borderRadius:14,fontSize:13,fontWeight:600,cursor:"pointer"}}>🔄 New Options</button>
              <button onClick={()=>{setRecipeList([]);setSelectedRecipe(null);setMethod(null);setAllergens([]);setRecipeStep(1);}} style={{padding:"13px",background:"white",color:C.dark,border:`2px solid ${C.light}`,borderRadius:14,fontSize:13,fontWeight:600,cursor:"pointer"}}>🔁 Start Over</button>
            </div>
          </div>)}
          {loadingDetail&&(<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:50,marginBottom:16}}>📖</div><div style={{fontSize:16,color:C.dark,fontWeight:600,marginBottom:8}}>Preparing recipe…</div><div style={{display:"flex",justifyContent:"center",gap:6,marginTop:16}}>{[0,1,2].map(i=>(<div key={i} style={{width:10,height:10,borderRadius:"50%",background:C.purple,animation:"bounce 1s infinite",animationDelay:`${i*0.2}s`}}/>))}</div></div>)}
          {selectedRecipe&&!selectedRecipe.loading&&!loadingDetail&&(<div>
            <div style={{display:"flex",gap:10,marginBottom:12}}><button onClick={()=>setSelectedRecipe(null)} style={{background:"none",border:"none",color:C.orange,fontSize:13,cursor:"pointer",padding:0}}>← Back to options</button><button onClick={goHome} style={{background:"none",border:"none",color:C.purple,fontSize:13,cursor:"pointer",padding:0}}>🏠 Home</button></div>
            <FullRecipeCard r={selectedRecipe} onSave={saveRecipe} showSave={true}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
              <button onClick={()=>setSelectedRecipe(null)} style={{padding:"13px",background:"white",color:C.dark,border:`2px solid ${C.light}`,borderRadius:14,fontSize:13,fontWeight:600,cursor:"pointer"}}>← Options</button>
              <button onClick={()=>{setRecipeList([]);setSelectedRecipe(null);setRecipeStep(2);}} style={{padding:"13px",background:`linear-gradient(135deg,${C.orange},${C.pink})`,color:"white",border:"none",borderRadius:14,fontSize:13,fontWeight:600,cursor:"pointer"}}>🔄 New</button>
            </div>
            <button onClick={()=>setMode("chat")} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${C.purple},${C.blue})`,color:"white",border:"none",borderRadius:14,fontSize:13,fontWeight:600,cursor:"pointer",marginTop:10}}>💬 Ask Baby Chef</button>
          </div>)}
        </div>)}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      <Toast/><BottomNav/>
    </div>
  );

  // ── CHAT ──
  if(mode==="chat")return(
    <div style={{fontFamily:"sans-serif",background:C.cream,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(135deg,${C.purple},${C.blue})`,padding:"14px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <button onClick={goHome} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>← Home</button>
          <div style={{flex:1}}><div style={{color:"white",fontWeight:600,fontSize:15}}>💬 Baby Chef Chat</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>Ask me anything!</div></div>
          <LangSelect/>
        </div>
        <AgeBar/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
        {messages.map((msg,i)=>(<div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",alignItems:"flex-start",gap:8}}>
          {msg.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>👶</div>}
          <div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:msg.role==="user"?`linear-gradient(135deg,${C.orange},${C.pink})`:"white",color:msg.role==="user"?"white":C.dark,fontSize:13,lineHeight:1.7,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",whiteSpace:"pre-wrap"}}>{msg.content}</div>
        </div>))}
        {chatLoading&&(<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>👶</div><div style={{background:"white",borderRadius:"18px 18px 18px 4px",padding:"10px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",display:"flex",gap:4}}>{[0,1,2].map(i=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.purple,animation:"bounce 1s infinite",animationDelay:`${i*0.2}s`}}/>))}</div></div>)}
        <div ref={bottomRef}/>
      </div>
      {messages.length<=1&&(<div style={{padding:"0 14px 8px",display:"flex",gap:8,overflowX:"auto"}}>{QUICK_Q.map((q,i)=>(<button key={i} onClick={()=>sendChatMessage(q)} style={{padding:"8px 14px",borderRadius:20,border:`1.5px solid ${C.light}`,background:"white",color:C.dark,fontSize:12,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>{q}</button>))}</div>)}
      {chatImageUrl&&(<div style={{padding:"6px 14px",display:"flex",alignItems:"center",gap:10,background:"white"}}><img src={chatImageUrl} style={{width:48,height:48,objectFit:"cover",borderRadius:8}} alt=""/><span style={{fontSize:12,color:"#7a7a8a"}}>Photo ready</span><button onClick={()=>{setChatImage(null);setChatImageUrl(null);}} style={{padding:"3px 8px",background:C.light,border:"none",borderRadius:8,fontSize:12,cursor:"pointer"}}>✕</button></div>)}
      <div style={{padding:"10px 14px",background:"white",borderTop:`1px solid ${C.light}`,display:"flex",gap:8,alignItems:"center"}}>
        <button onClick={()=>chatFileRef.current.click()} style={{width:36,height:36,borderRadius:"50%",border:`1.5px solid ${C.light}`,background:C.cream,fontSize:16,cursor:"pointer",flexShrink:0}}>📷</button>
        <input ref={chatFileRef} type="file" accept="image/*" onChange={handleChatImg} style={{display:"none"}}/>
        <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChatMessage();}}} placeholder="Ask anything about baby food…" rows={1} style={{flex:1,padding:"9px 13px",borderRadius:18,border:`1.5px solid ${C.light}`,fontSize:13,fontFamily:"sans-serif",resize:"none",outline:"none",background:C.cream,color:C.dark}}/>
        <button onClick={()=>sendChatMessage()} disabled={chatLoading||(!chatInput.trim()&&!chatImage)} style={{width:36,height:36,borderRadius:"50%",border:"none",background:(chatLoading||(!chatInput.trim()&&!chatImage))?"#ddd":`linear-gradient(135deg,${C.purple},${C.blue})`,color:"white",fontSize:16,cursor:"pointer",flexShrink:0}}>➤</button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );

  // ── COOKBOOK ──
  if(mode==="cookbook"){
    const filteredCb=savedRecipes.filter(r=>{
      if(cbSearch&&!r.name.toLowerCase().includes(cbSearch.toLowerCase()))return false;
      if(cbFilterTag&&!(ratings[r.id]?.tags||[]).includes(cbFilterTag))return false;
      return true;
    }).sort((a,b)=>{
      if(cbSort==="stars")return(ratings[b.id]?.stars||0)-(ratings[a.id]?.stars||0);
      if(cbSort==="name")return a.name.localeCompare(b.name);
      return b.id-a.id;
    });
    if(cookbookSelected)return(
      <div style={{fontFamily:"sans-serif",background:C.cream,minHeight:"100vh",paddingBottom:70}}>
        <div style={{background:`linear-gradient(135deg,${C.green},${C.blue})`,padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setCookbookSelected(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>← Back</button><button onClick={goHome} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>🏠 Home</button>
          <div style={{flex:1,color:"white",fontWeight:600,fontSize:15}}>📖 Recipe Detail</div>
          <button onClick={()=>openRatingModal(cookbookSelected)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>{ratings[cookbookSelected.id]?.stars?"✏️ Edit":"⭐ Rate"}</button>
        </div>
        <div style={{padding:"16px"}}>
          <FullRecipeCard r={cookbookSelected} showSave={false}/>
          {ratings[cookbookSelected.id]?.stars&&(<div style={{background:"white",borderRadius:14,padding:"14px",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:8}}>Your Rating</div>
            <div style={{display:"flex",gap:2,marginBottom:8}}>{[1,2,3].map(i=>(<span key={i} style={{fontSize:20,opacity:i<=ratings[cookbookSelected.id].stars?1:0.2}}>⭐</span>))}</div>
            {(ratings[cookbookSelected.id].tags||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>{TAGS.filter(t=>(ratings[cookbookSelected.id].tags||[]).includes(t.id)).map(tag=>(<span key={tag.id} style={{background:`${tag.color}15`,color:tag.color,borderRadius:20,padding:"3px 10px",fontSize:12}}>{tag.label}</span>))}</div>}
            {ratings[cookbookSelected.id].note&&<div style={{fontSize:13,color:"#7a7a8a",fontStyle:"italic"}}>📝 "{ratings[cookbookSelected.id].note}"</div>}
          </div>)}
          <button onClick={()=>deleteRecipe(cookbookSelected.id)} style={{width:"100%",padding:"12px",background:"white",border:"1.5px solid #ffaaaa",color:C.red,borderRadius:12,fontSize:14,cursor:"pointer"}}>🗑 Remove from Cookbook</button>
        </div>
        <RatingModal/><Toast/><BottomNav/>
      </div>
    );
    return(
      <div style={{fontFamily:"sans-serif",background:C.cream,minHeight:"100vh",paddingBottom:70}}>
        <div style={{background:`linear-gradient(135deg,${C.green},${C.blue})`,padding:"14px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={goHome} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>← Home</button>
              <div><div style={{color:"white",fontWeight:600,fontSize:15}}>📖 My Cookbook</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{savedRecipes.length} saved · {ratedCount} rated · {favCount} ❤️</div></div>
            </div>
            <LangSelect/>
          </div>
        </div>
        <div style={{background:"white",padding:"12px 16px",borderBottom:`1px solid ${C.light}`}}>
          <input value={cbSearch} onChange={e=>setCbSearch(e.target.value)} placeholder="🔍 Search recipes…" style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:13,marginBottom:10,boxSizing:"border-box",outline:"none",background:C.cream}}/>
          <div style={{display:"flex",gap:6,marginBottom:8,overflowX:"auto"}}>
            <button onClick={()=>setCbFilterTag(null)} style={{padding:"4px 12px",borderRadius:20,border:`1.5px solid ${!cbFilterTag?C.green:C.light}`,background:!cbFilterTag?C.green:"white",color:!cbFilterTag?"white":C.dark,fontSize:12,cursor:"pointer",flexShrink:0}}>All</button>
            {TAGS.map(t=>(<button key={t.id} onClick={()=>setCbFilterTag(cbFilterTag===t.id?null:t.id)} style={{padding:"4px 12px",borderRadius:20,border:`1.5px solid ${cbFilterTag===t.id?t.color:C.light}`,background:cbFilterTag===t.id?`${t.color}20`:"white",color:cbFilterTag===t.id?t.color:C.dark,fontSize:12,cursor:"pointer",flexShrink:0}}>{t.label}</button>))}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:12,color:"#aaa"}}>Sort:</span>
            {[{v:"newest",l:"Newest"},{v:"stars",l:"⭐ Top"},{v:"name",l:"A-Z"}].map(s=>(<button key={s.v} onClick={()=>setCbSort(s.v)} style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${cbSort===s.v?C.blue:C.light}`,background:cbSort===s.v?C.blue:"white",color:cbSort===s.v?"white":C.dark,fontSize:12,cursor:"pointer"}}>{s.l}</button>))}
          </div>
        </div>
        <div style={{padding:"16px"}}>
          {savedRecipes.length===0?(
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:60,marginBottom:16}}>📖</div>
              <div style={{fontSize:18,fontFamily:"Georgia",color:C.dark,marginBottom:8}}>Your cookbook is empty</div>
              <div style={{fontSize:13,color:"#aaa",marginBottom:20}}>Generate recipes and save your favourites!</div>
              <button onClick={()=>setMode("recipe")} style={{padding:"13px 24px",background:`linear-gradient(135deg,${C.orange},${C.pink})`,color:"white",border:"none",borderRadius:14,fontSize:14,fontWeight:600,cursor:"pointer"}}>🍽 Get My First Recipe</button>
            </div>
          ):filteredCb.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa",fontSize:14}}>No recipes match your filters</div>
          ):(
            filteredCb.map((r,i)=>{
              const rating=ratings[r.id];
              const rTags=TAGS.filter(t=>(rating?.tags||[]).includes(t.id));
              return(<div key={r.id} onClick={()=>setCookbookSelected(r)} style={{background:"white",borderRadius:18,marginBottom:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",cursor:"pointer"}}>
                <div style={{height:6,background:CARD_COLORS[i%5].bg}}/>
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{flex:1}}><div style={{fontFamily:"Georgia",color:C.dark,fontSize:15,fontWeight:600,marginBottom:3}}>{r.name}</div><div style={{fontSize:12,color:"#aaa"}}>{r.babyAge} · {r.difficulty} · {r.savedAt}</div></div>
                    {rating?.stars?(<div style={{display:"flex",gap:2}}>{[1,2,3].map(i=>(<span key={i} style={{fontSize:14,opacity:i<=rating.stars?1:0.2}}>⭐</span>))}</div>):(<button onClick={e=>{e.stopPropagation();openRatingModal(r);}} style={{padding:"4px 10px",background:`${C.orange}15`,border:`1px solid ${C.orange}33`,borderRadius:20,fontSize:11,color:C.orange,cursor:"pointer"}}>+ Rate</button>)}
                  </div>
                  {rTags.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>{rTags.map(tag=>(<span key={tag.id} style={{background:`${tag.color}15`,color:tag.color,borderRadius:20,padding:"2px 8px",fontSize:11}}>{tag.label}</span>))}</div>}
                  {rating?.note&&<div style={{fontSize:12,color:"#7a7a8a",fontStyle:"italic"}}>📝 "{rating.note.substring(0,60)}{rating.note.length>60?"…":""}"</div>}
                </div>
              </div>);
            })
          )}
        </div>
        <RatingModal/><Toast/><BottomNav/>
      </div>
    );
  }

  // ── TRACKER ──
  if(mode==="tracker"){
    const allF=getAllFoods();
    const filteredF=trackerSearch?{"🔍 Results":Object.values(allF).flat().filter(f=>f.name.toLowerCase().includes(trackerSearch.toLowerCase()))}:{[activeCat]:allF[activeCat]||[]};
    const lastEntry=Object.entries(trackerLog).sort((a,b)=>new Date(b[1].date)-new Date(a[1].date))[0];
    const waitingEntries=Object.entries(trackerLog).filter(([k,v])=>daysSince(v.date)<3&&v.reaction!=="allergic");
    const notTriedFoods=appropriateFoods.filter(f=>!trackerLog[f.name]);
    const suggestedNext=notTriedFoods[0];
    return(
      <div style={{fontFamily:"sans-serif",background:C.cream,minHeight:"100vh",paddingBottom:70}}>
        <div style={{background:`linear-gradient(135deg,${C.amber},${C.orange})`,padding:"14px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={goHome} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>← Home</button>
              <div><div style={{color:"white",fontWeight:600,fontSize:15}}>🥕 Food Tracker</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{babyName?`${babyName} · `:""}{babyAge}</div></div>
            </div>
            <LangSelect/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:10}}>
            {[{l:"Tried",v:triedCount},{l:"Safe ✅",v:safeCount},{l:"Wait ⏳",v:waitingCount},{l:"⚠️",v:allergicCount}].map((s,i)=>(<div key={i} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"8px 6px",textAlign:"center"}}><div style={{color:"white",fontWeight:700,fontSize:18}}>{s.v}</div><div style={{color:"rgba(255,255,255,0.75)",fontSize:10}}>{s.l}</div></div>))}
          </div>
          <div style={{height:6,background:"rgba(255,255,255,0.2)",borderRadius:20,overflow:"hidden"}}><div style={{height:"100%",width:`${progressPct}%`,background:"white",borderRadius:20}}/></div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:4,textAlign:"right"}}>{safeCount}/{appropriateFoods.length} ({progressPct}%)</div>
        </div>
        <div style={{background:"white",padding:"8px 16px",borderBottom:`1px solid ${C.light}`,display:"flex",gap:8}}>
          {[{id:"foods",l:"🥕 Foods"},{id:"log",l:"📋 History"},{id:"progress",l:"📊 Progress"}].map(t=>(<button key={t.id} onClick={()=>setTrackerView(t.id)} style={{padding:"7px 16px",borderRadius:20,border:"none",fontSize:12,fontWeight:500,cursor:"pointer",background:trackerView===t.id?C.amber:"#f5f5f5",color:trackerView===t.id?"white":C.dark}}>{t.l}</button>))}
        </div>
        <div style={{padding:"16px"}}>
          {trackerView==="foods"&&(<div>
            {(()=>{
              if(waitingEntries.length>0){const[name,entry]=waitingEntries[0];const dl=3-daysSince(entry.date);const rd=new Date(new Date(entry.date).getTime()+3*864e5);const rs=rd.toLocaleDateString("en-MY",{weekday:"long",day:"numeric",month:"short"});
                return(<div style={{background:"#FFF9E6",border:"1px solid #F59E0B44",borderRadius:16,padding:"14px 16px",marginBottom:16}}><div style={{fontSize:12,color:C.amber,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>⏳ Waiting Period</div><div style={{fontSize:14,color:C.dark,fontWeight:600,marginBottom:4}}>Introduced <strong>{name}</strong> {daysSince(entry.date)} day{daysSince(entry.date)!==1?"s":""} ago</div><div style={{fontSize:13,color:"#7a7a8a",marginBottom:8}}>Wait <strong style={{color:C.amber}}>{dl} more day{dl!==1?"s":""}</strong> before anything new. Come back on <strong>{rs}</strong>!</div><div style={{background:"#F59E0B20",borderRadius:10,padding:"8px 12px",fontSize:12,color:C.amber}}>🔍 Watch for: rash, swelling, vomiting, diarrhea, unusual fussiness</div></div>);
              }
              if(triedCount===0)return(<div style={{background:`${C.green}15`,border:`1px solid ${C.green}44`,borderRadius:16,padding:"14px 16px",marginBottom:16}}><div style={{fontSize:12,color:C.green,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>🌱 Let's Get Started!</div><div style={{fontSize:14,color:C.dark,fontWeight:600,marginBottom:4}}>No foods logged yet</div><div style={{fontSize:13,color:"#7a7a8a",marginBottom:suggestedNext?10:0}}>Tap any food card to log it!</div>{suggestedNext&&(<div onClick={()=>openLogFood(suggestedNext)} style={{display:"flex",alignItems:"center",gap:10,background:"white",borderRadius:12,padding:"10px 14px",cursor:"pointer",border:`1px solid ${C.green}44`}}><span style={{fontSize:24}}>{suggestedNext.emoji}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.dark}}>Try first: {suggestedNext.name}</div><div style={{fontSize:11,color:"#aaa"}}>Great for {babyAge}</div></div><div style={{background:C.green,color:"white",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>+ Log</div></div>)}</div>);
              if(suggestedNext)return(<div style={{background:`${C.green}15`,border:`1px solid ${C.green}44`,borderRadius:16,padding:"14px 16px",marginBottom:16}}><div style={{fontSize:12,color:C.green,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>🎉 Ready for a New Food!</div><div style={{fontSize:14,color:C.dark,fontWeight:600,marginBottom:4}}>{lastEntry?`${lastEntry[0]} confirmed safe!`:"All clear!"}</div><div onClick={()=>openLogFood(suggestedNext)} style={{display:"flex",alignItems:"center",gap:10,background:"white",borderRadius:12,padding:"10px 14px",cursor:"pointer",border:`1px solid ${C.green}44`,marginTop:10}}><span style={{fontSize:24}}>{suggestedNext.emoji}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.dark}}>{suggestedNext.name}</div></div><div style={{background:C.green,color:"white",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>Introduce</div></div></div>);
              return(<div style={{background:`${C.blue}15`,border:`1px solid ${C.blue}44`,borderRadius:16,padding:"14px 16px",marginBottom:16}}><div style={{fontSize:12,color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>🏆 Amazing Progress!</div><div style={{fontSize:14,color:C.dark}}>All recommended foods introduced! 👏</div></div>);
            })()}
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <input value={trackerSearch} onChange={e=>setTrackerSearch(e.target.value)} placeholder="🔍 Search foods…" style={{flex:1,padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:13,outline:"none",background:"white",color:C.dark}}/>
              <button onClick={()=>setShowAddCustom(true)} style={{padding:"10px 14px",background:`linear-gradient(135deg,${C.purple},${C.blue})`,color:"white",border:"none",borderRadius:12,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>+ Add</button>
            </div>
            {!trackerSearch&&(<div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4}}>{Object.keys(allF).map(cat=>(<button key={cat} onClick={()=>setActiveCat(cat)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${activeCat===cat?C.amber:C.light}`,background:activeCat===cat?C.amber:"white",color:activeCat===cat?"white":C.dark,fontSize:12,cursor:"pointer",flexShrink:0,fontWeight:activeCat===cat?600:400}}>{cat}</button>))}</div>)}
            {Object.entries(filteredF).map(([cat,foods])=>(<div key={cat}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {foods.map(food=>{const ok=isAgeOk(food.minAge,babyAge);const st=getStatus(food.name);const sty=getStatusStyle(st);const entry=trackerLog[food.name];const days=entry?daysSince(entry.date):null;
                return(<div key={food.name} onClick={()=>ok&&openLogFood(food)} style={{background:sty.bg,borderRadius:14,padding:"12px",border:`1.5px solid ${sty.border}`,cursor:ok?"pointer":"default",opacity:ok?1:0.4}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:22}}>{food.emoji}</span><div style={{flex:1}}><div style={{fontWeight:600,color:C.dark,fontSize:13}}>{food.name}</div>{!ok&&<div style={{fontSize:10,color:"#aaa"}}>From {food.minAge}</div>}</div></div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:11,color:sty.color,fontWeight:600}}>{sty.label}</div>{ok&&<div style={{fontSize:10,color:"white",background:sty.color,borderRadius:20,padding:"2px 8px"}}>tap</div>}</div>
                  {st==="waiting"&&days!==null&&<div style={{fontSize:10,color:C.amber,marginTop:2}}>{3-days} day{3-days!==1?"s":""} left</div>}
                  {entry?.notes&&<div style={{fontSize:10,color:"#aaa",marginTop:2,fontStyle:"italic"}}>"{entry.notes}"</div>}
                </div>);
              })}</div></div>))}
          </div>)}
          {trackerView==="log"&&(<div>
            <h3 style={{color:C.dark,fontSize:"1rem",marginBottom:16}}>Introduction History</h3>
            {Object.keys(trackerLog).length===0?(<div style={{textAlign:"center",padding:"40px 20px",color:"#aaa"}}><div style={{fontSize:40,marginBottom:12}}>📋</div><div style={{fontSize:14}}>No foods logged yet.</div></div>):
            Object.entries(trackerLog).sort((a,b)=>new Date(b[1].date)-new Date(a[1].date)).map(([name,entry])=>{
              const st=getStatus(name);const sty=getStatusStyle(st);const days=daysSince(entry.date);const reaction=REACTIONS.find(r=>r.value===entry.reaction);
              return(<div key={name} style={{background:"white",borderRadius:14,padding:"14px",marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{fontSize:28,flexShrink:0}}>{entry.emoji||"🍽"}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,color:C.dark,fontSize:14,marginBottom:2}}>{name}</div><div style={{fontSize:12,color:"#aaa",marginBottom:4}}>Introduced {new Date(entry.date).toLocaleDateString("en-MY",{day:"numeric",month:"short",year:"numeric"})} · {days} day{days!==1?"s":""} ago</div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{background:`${sty.border}22`,color:sty.color,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{sty.label}</span>{reaction&&<span style={{fontSize:12}}>{reaction.emoji} {reaction.label}</span>}</div>{entry.notes&&<div style={{fontSize:12,color:"#7a7a8a",marginTop:4,fontStyle:"italic"}}>"{entry.notes}"</div>}</div>
                <button onClick={()=>removeLog(name)} style={{background:"none",border:"none",color:"#ddd",fontSize:16,cursor:"pointer",padding:4,flexShrink:0}}>✕</button>
              </div>);
            })}
          </div>)}
          {trackerView==="progress"&&(<div>
            <h3 style={{color:C.dark,fontSize:"1rem",marginBottom:16}}>Progress by Category</h3>
            <div style={{background:`linear-gradient(135deg,${C.amber},${C.orange})`,borderRadius:20,padding:"20px",marginBottom:16,textAlign:"center"}}><div style={{color:"white",fontSize:40,fontWeight:700}}>{progressPct}%</div><div style={{color:"rgba(255,255,255,0.85)",fontSize:13}}>of recommended foods introduced</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:4}}>{safeCount} safe out of {appropriateFoods.length} foods</div></div>
            {Object.entries(getAllFoods()).map(([cat,foods])=>{const ap=foods.filter(f=>isAgeOk(f.minAge,babyAge));const tr=ap.filter(f=>trackerLog[f.name]&&getStatus(f.name)==="safe");const pct=ap.length>0?Math.round((tr.length/ap.length)*100):0;return(<div key={cat} style={{background:"white",borderRadius:14,padding:"14px",marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:600,color:C.dark,fontSize:14}}>{cat}</span><span style={{fontSize:12,color:C.amber,fontWeight:600}}>{tr.length}/{ap.length}</span></div><div style={{height:6,background:"#f0f0f0",borderRadius:20,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.amber},${C.orange})`,borderRadius:20}}/></div></div>);})}
            {allergicCount>0&&(<div style={{background:`${C.red}10`,border:`1px solid ${C.red}33`,borderRadius:14,padding:"14px",marginTop:8}}><div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:8}}>⚠️ Avoid these foods:</div>{Object.entries(trackerLog).filter(([k,v])=>v.reaction==="allergic").map(([name,entry])=>(<div key={name} style={{fontSize:13,color:C.dark,marginBottom:4,display:"flex",gap:8}}><span>{entry.emoji||"🍽"}</span><span>{name}</span></div>))}</div>)}
          </div>)}
        </div>
        {selectedFood&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:100}}>
          <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:500,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><span style={{fontSize:36}}>{selectedFood.emoji}</span><div><div style={{fontWeight:700,color:C.dark,fontSize:18}}>{selectedFood.name}</div><div style={{fontSize:12,color:"#aaa"}}>Log for {babyName||"baby"}</div></div></div>
            <label style={{fontSize:12,color:"#7a7a8a",display:"block",marginBottom:6}}>Date introduced</label>
            <input type="date" value={logDate} onChange={e=>setLogDate(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:14,marginBottom:16,boxSizing:"border-box",outline:"none"}}/>
            <label style={{fontSize:12,color:"#7a7a8a",display:"block",marginBottom:8}}>Baby's reaction</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>{REACTIONS.map(r=>(<div key={r.value} onClick={()=>setLogReaction(r.value)} style={{background:logReaction===r.value?`${r.color}20`:"#f9f9f9",border:`2px solid ${logReaction===r.value?r.color:"#eee"}`,borderRadius:12,padding:"12px",textAlign:"center",cursor:"pointer"}}><div style={{fontSize:22}}>{r.emoji}</div><div style={{fontSize:12,fontWeight:logReaction===r.value?700:400,color:logReaction===r.value?r.color:C.dark}}>{r.label}</div></div>))}</div>
            <input value={logNotes} onChange={e=>setLogNotes(e.target.value)} placeholder="Notes (optional): e.g. mixed with apple…" style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:13,marginBottom:16,boxSizing:"border-box",outline:"none"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button onClick={()=>setSelectedFood(null)} style={{padding:"13px",background:"white",border:`1.5px solid ${C.light}`,borderRadius:14,fontSize:14,cursor:"pointer",color:C.dark}}>Cancel</button>
              <button onClick={saveLog} disabled={!logReaction} style={{padding:"13px",background:!logReaction?"#ccc":`linear-gradient(135deg,${C.amber},${C.orange})`,color:"white",border:"none",borderRadius:14,fontSize:14,fontWeight:600,cursor:!logReaction?"not-allowed":"pointer"}}>Save Log ✓</button>
            </div>
          </div>
        </div>)}
        {showAddCustom&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:100}}>
          <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:500,margin:"0 auto"}}>
            <h3 style={{color:C.dark,marginBottom:16,fontSize:"1rem"}}>Add Custom Food</h3>
            <input value={customFoodName} onChange={e=>setCustomFoodName(e.target.value)} placeholder="e.g. Durian, Dragon Fruit…" style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:14,marginBottom:14,boxSizing:"border-box",outline:"none"}}/>
            <select value={customFoodCat} onChange={e=>setCustomFoodCat(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:14,marginBottom:16,boxSizing:"border-box",background:"white"}}>
              {Object.keys(FOOD_LIBRARY).map(c=>(<option key={c} value={c}>{c}</option>))}
            </select>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button onClick={()=>setShowAddCustom(false)} style={{padding:"13px",background:"white",border:`1.5px solid ${C.light}`,borderRadius:14,fontSize:14,cursor:"pointer",color:C.dark}}>Cancel</button>
              <button onClick={addCustomFood} disabled={!customFoodName.trim()} style={{padding:"13px",background:!customFoodName.trim()?"#ccc":`linear-gradient(135deg,${C.purple},${C.blue})`,color:"white",border:"none",borderRadius:14,fontSize:14,fontWeight:600,cursor:!customFoodName.trim()?"not-allowed":"pointer"}}>Add Food</button>
            </div>
          </div>
        </div>)}
        <Toast/><BottomNav/>
      </div>
    );
  }

  // ── PLANNER ──
  if(mode==="planner")return(
    <div style={{fontFamily:"sans-serif",background:C.cream,minHeight:"100vh",paddingBottom:70}}>
      <div style={{background:`linear-gradient(135deg,${C.purple},${C.blue})`,padding:"14px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={goHome} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>← Home</button>
          <div style={{flex:1}}><div style={{color:"white",fontWeight:600,fontSize:15}}>📅 Meal Planner</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>Plan baby's week + shopping list</div></div>
          <LangSelect/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          {[{l:"Meals",v:`${totalMeals}/21`},{l:"Days",v:`${completeDays}/7`},{l:"🛒",v:`${checkedCount}/${shoppingList.length}`}].map((s,i)=>(<div key={i} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"8px 6px",textAlign:"center"}}><div style={{color:"white",fontWeight:700,fontSize:16}}>{s.v}</div><div style={{color:"rgba(255,255,255,0.75)",fontSize:10}}>{s.l}</div></div>))}
        </div>
        <AgeBar/>
      </div>
      <div style={{background:"white",padding:"10px 16px",borderBottom:`1px solid ${C.light}`,display:"flex",gap:8}}>
        <button onClick={generateWeekPlan} disabled={loadingPlan} style={{flex:2,padding:"10px",background:loadingPlan?"#ccc":`linear-gradient(135deg,${C.purple},${C.blue})`,color:"white",border:"none",borderRadius:12,fontSize:13,fontWeight:600,cursor:loadingPlan?"not-allowed":"pointer"}}>{loadingPlan?"Planning meals…":"✨ Generate Full Week"}</button>
        <button onClick={()=>setPlannerView(plannerView==="plan"?"shopping":"plan")} style={{flex:1,padding:"10px",background:plannerView==="shopping"?C.green:"white",color:plannerView==="shopping"?"white":C.dark,border:`1.5px solid ${plannerView==="shopping"?C.green:C.light}`,borderRadius:12,fontSize:12,fontWeight:500,cursor:"pointer"}}>🛒 List</button>
      </div>
      {plannerView==="plan"&&(<div>
        <div style={{background:"white",padding:"8px 16px",borderBottom:`1px solid ${C.light}`,display:"flex",gap:6,overflowX:"auto"}}>
          {DAYS.map((day,i)=>{const dp=plan[day]||{};const complete=Object.keys(dp).length===3;return(<button key={day} onClick={()=>setActiveDay(day)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${activeDay===day?C.purple:C.light}`,background:activeDay===day?C.purple:complete?`${C.green}15`:"white",color:activeDay===day?"white":complete?C.green:C.dark,fontSize:12,cursor:"pointer",flexShrink:0,fontWeight:activeDay===day?600:400,position:"relative"}}>{day.slice(0,3)}{complete&&<span style={{position:"absolute",top:-4,right:-4,fontSize:9}}>✅</span>}</button>);})}
        </div>
        <div style={{padding:"16px"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.dark,marginBottom:14}}>{activeDay}</div>
          {MEALS.map(meal=>{const entry=plan[activeDay]?.[meal];return(
            <div key={meal} style={{background:"white",borderRadius:16,marginBottom:12,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <div style={{background:entry?`linear-gradient(135deg,${C.purple},${C.blue})`:"#f9f9f9",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>{MEAL_EMOJIS[meal]}</span>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:entry?"white":"#aaa",textTransform:"uppercase",letterSpacing:1}}>{meal}</div>{entry&&<div style={{fontSize:13,color:"rgba(255,255,255,0.9)",fontWeight:600}}>{entry.name}</div>}</div>
                {entry&&<button onClick={()=>removeMealSlot(activeDay,meal)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Remove</button>}
              </div>
              {entry?(<div style={{padding:"10px 14px"}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {entry.portions&&<span style={{background:`${C.purple}15`,color:C.purple,borderRadius:20,padding:"2px 10px",fontSize:11}}>👥 {entry.portions}</span>}
                  {entry.fromCookbook&&<span style={{background:`${C.green}15`,color:C.green,borderRadius:20,padding:"2px 10px",fontSize:11}}>📖 Cookbook</span>}
                  {entry.custom&&<span style={{background:`${C.orange}15`,color:C.orange,borderRadius:20,padding:"2px 10px",fontSize:11}}>✏️ Custom</span>}
                </div>
                {entry.ingredients?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{entry.ingredients.slice(0,4).map((ing,i)=>(<span key={i} style={{background:"#f5f5f5",color:"#7a7a8a",borderRadius:20,padding:"2px 8px",fontSize:11}}>{ing}</span>))}{entry.ingredients.length>4&&<span style={{color:"#aaa",fontSize:11}}>+{entry.ingredients.length-4}</span>}</div>}
              </div>):(<div style={{padding:"14px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <button onClick={()=>setShowSlotPicker({day:activeDay,meal})} style={{padding:"10px",background:`${C.purple}10`,border:`1.5px dashed ${C.purple}44`,borderRadius:12,fontSize:12,color:C.purple,cursor:"pointer"}}>📖 From Cookbook</button>
                <button onClick={()=>{setShowCustomMeal({day:activeDay,meal});setCustomMealName("");}} style={{padding:"10px",background:`${C.orange}10`,border:`1.5px dashed ${C.orange}44`,borderRadius:12,fontSize:12,color:C.orange,cursor:"pointer"}}>✏️ Custom</button>
              </div></div>)}
            </div>
          );})}
          {MEALS.every(meal=>plan[activeDay]?.[meal])&&(<div style={{background:`${C.green}15`,border:`1px solid ${C.green}44`,borderRadius:14,padding:"12px 16px",textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>✅</div><div style={{fontSize:13,color:C.green,fontWeight:600}}>{activeDay} is fully planned!</div></div>)}
        </div>
      </div>)}
      {plannerView==="shopping"&&(<div style={{padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h3 style={{color:C.dark,fontSize:"1rem",margin:0}}>Shopping List</h3><div style={{fontSize:12,color:"#aaa",marginTop:2}}>Ingredients needed this week</div></div><div style={{fontSize:13,color:C.green,fontWeight:600}}>{checkedCount}/{shoppingList.length} done</div></div>
        {shoppingList.length===0?(<div style={{textAlign:"center",padding:"40px 20px",color:"#aaa"}}><div style={{fontSize:40,marginBottom:12}}>🛒</div><div style={{fontSize:14}}>Generate a weekly plan first!</div></div>):(
          <div>
            <div style={{height:8,background:"#f0f0f0",borderRadius:20,overflow:"hidden",marginBottom:16}}><div style={{height:"100%",width:`${shoppingList.length>0?(checkedCount/shoppingList.length)*100:0}%`,background:`linear-gradient(90deg,${C.green},${C.blue})`,borderRadius:20,transition:"width 0.3s"}}/></div>
            {shoppingList.map(item=>(<div key={item.id} onClick={()=>toggleCheck(item.id)} style={{background:"white",borderRadius:14,padding:"14px 16px",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:14,cursor:"pointer",opacity:checkedItems[item.id]?0.5:1}}>
              <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${checkedItems[item.id]?C.green:C.light}`,background:checkedItems[item.id]?C.green:"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{checkedItems[item.id]&&<span style={{color:"white",fontSize:12}}>✓</span>}</div>
              <div style={{flex:1}}><div style={{fontWeight:600,color:C.dark,fontSize:14,textDecoration:checkedItems[item.id]?"line-through":"none"}}>{item.name}</div><div style={{fontSize:11,color:"#aaa"}}>Used in {item.count} meal{item.count!==1?"s":""}</div></div>
              {item.count>1&&<div style={{background:`${C.purple}15`,color:C.purple,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>×{item.count}</div>}
            </div>))}
            {checkedCount===shoppingList.length&&shoppingList.length>0&&(<div style={{background:`${C.green}15`,border:`1px solid ${C.green}44`,borderRadius:14,padding:"16px",textAlign:"center",marginTop:8}}><div style={{fontSize:24,marginBottom:6}}>🎉</div><div style={{fontSize:14,color:C.green,fontWeight:600}}>All ingredients ready! Happy cooking!</div></div>)}
          </div>
        )}
      </div>)}
      {showSlotPicker&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:100}}>
        <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:500,margin:"0 auto",maxHeight:"70vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h3 style={{color:C.dark,fontSize:"1rem",margin:0}}>{MEAL_EMOJIS[showSlotPicker.meal]} {showSlotPicker.meal} · {showSlotPicker.day}</h3><button onClick={()=>setShowSlotPicker(null)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#aaa"}}>✕</button></div>
          {savedRecipes.length===0?(<div style={{textAlign:"center",padding:"30px 20px",color:"#aaa",fontSize:13}}>No saved recipes yet. Generate and save first!</div>):
          savedRecipes.map(recipe=>(<div key={recipe.id} onClick={()=>addMealFromCookbook(recipe,showSlotPicker.day,showSlotPicker.meal)} style={{background:"#f9f9f9",borderRadius:14,padding:"14px",marginBottom:8,cursor:"pointer",border:`1.5px solid ${C.light}`,display:"flex",alignItems:"center",gap:12}}><div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.purple},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🍽</div><div style={{flex:1}}><div style={{fontWeight:600,color:C.dark,fontSize:14}}>{recipe.name}</div><div style={{fontSize:11,color:"#aaa"}}>{recipe.babyAge} · {recipe.difficulty}</div></div><span style={{color:C.purple,fontSize:18}}>+</span></div>))}
        </div>
      </div>)}
      {showCustomMeal&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:100}}>
        <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:500,margin:"0 auto"}}>
          <h3 style={{color:C.dark,marginBottom:16,fontSize:"1rem"}}>{MEAL_EMOJIS[showCustomMeal.meal]} {showCustomMeal.meal} · {showCustomMeal.day}</h3>
          <input value={customMealName} onChange={e=>setCustomMealName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomMealSlot(showCustomMeal.day,showCustomMeal.meal)} placeholder="e.g. Sweet Potato Puree…" style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${C.light}`,fontSize:14,marginBottom:16,boxSizing:"border-box",outline:"none"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>setShowCustomMeal(null)} style={{padding:"13px",background:"white",border:`1.5px solid ${C.light}`,borderRadius:14,fontSize:14,cursor:"pointer",color:C.dark}}>Cancel</button>
            <button onClick={()=>addCustomMealSlot(showCustomMeal.day,showCustomMeal.meal)} disabled={!customMealName.trim()} style={{padding:"13px",background:!customMealName.trim()?"#ccc":`linear-gradient(135deg,${C.purple},${C.blue})`,color:"white",border:"none",borderRadius:14,fontSize:14,fontWeight:600,cursor:!customMealName.trim()?"not-allowed":"pointer"}}>Add</button>
          </div>
        </div>
      </div>)}
      <Toast/><BottomNav/>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );

  return null;
}

ReactDOM.render(React.createElement(BabyFoodApp), document.getElementById('root'));