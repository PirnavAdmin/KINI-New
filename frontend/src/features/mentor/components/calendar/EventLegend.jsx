import { EVENT_TYPE_CONFIG } from '../../data/mockCalendarData'
export default function EventLegend(){return <>{Object.entries(EVENT_TYPE_CONFIG).map(([key,val])=><span key={key} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500"><i className="h-2 w-2 rounded-full" style={{backgroundColor:val.color}}/>{val.label}</span>)}</>}
