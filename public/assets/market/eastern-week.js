const calendar=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'});
const clock=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',hourCycle:'h23'});
function parts(date){return Object.fromEntries(calendar.formatToParts(date).map(part=>[part.type,part.value]));}
function dateKey(value){return typeof value==='string'&&value.length===10&&value[4]==='-'&&value[7]==='-'&&[0,1,2,3,5,6,8,9].every(i=>value[i]>='0'&&value[i]<='9');}
export function marketWeekKey(value=new Date(),offset=0){
  let key;
  if(dateKey(value))key=value;
  else {const date=new Date(value);if(!Number.isFinite(date.getTime()))throw new Error('invalid_week');const p=parts(date);key=`${p.year}-${p.month}-${p.day}`;}
  const day=new Date(`${key}T00:00:00.000Z`);
  if(!Number.isFinite(day.getTime())||day.toISOString().slice(0,10)!==key)throw new Error('invalid_week');
  day.setUTCDate(day.getUTCDate()-((day.getUTCDay()+6)%7)+offset*7);
  return day.toISOString().slice(0,10);
}
export function marketWeekStart(key){
  const monday=marketWeekKey(key);
  const midnight=Date.parse(`${monday}T00:00:00.000Z`);
  const hour=Number(clock.format(new Date(midnight+12*3600000)));
  return new Date(midnight+(12-hour)*3600000);
}
export function marketWeekRange(value){
  const key=marketWeekKey(value??new Date());
  return [marketWeekStart(key).toISOString(),marketWeekStart(marketWeekKey(key,1)).toISOString()];
}
