export const DAILY_KEY="tzt-minesweeper-daily-v1";
export function dateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
export function hashSeed(text){let hash=2166136261;for(const char of text){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return hash>>>0;}
export function seededRandom(seed){let value=seed>>>0;return()=>{value+=0x6D2B79F5;let result=value;result=Math.imul(result^result>>>15,result|1);result^=result+Math.imul(result^result>>>7,result|61);return((result^result>>>14)>>>0)/4294967296};}
export function normalizeRecords(value){if(!Array.isArray(value))return[];return value.filter(item=>item&&/^\d{4}-\d{2}-\d{2}$/.test(item.date)&&Number(item.seconds)>0).map(item=>({date:item.date,seconds:Math.round(Number(item.seconds))})).sort((a,b)=>a.seconds-b.seconds).slice(0,10);}
export function recordCompletion(records,completion){const current=normalizeRecords(records);const same=current.find(item=>item.date===completion.date);if(same&&same.seconds<=completion.seconds)return current;return normalizeRecords([...current.filter(item=>item.date!==completion.date),completion]);}
export function loadRecords(storage=globalThis.localStorage){try{return normalizeRecords(JSON.parse(storage?.getItem(DAILY_KEY)||"[]"))}catch{return[]}}
export function saveRecords(records,storage=globalThis.localStorage){const normalized=normalizeRecords(records);storage?.setItem(DAILY_KEY,JSON.stringify(normalized));return normalized;}
