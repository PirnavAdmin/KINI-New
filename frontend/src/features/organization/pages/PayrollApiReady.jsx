import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, BarChart3, CalendarDays, CreditCard, Database, Eye, FileText, IndianRupee, Info, PieChart, Play, RefreshCw, TrendingUp, Users, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { OrgEmpty, OrgHero, OrgKpiCard, OrgPage, OrgPanel, OrgSelect, OrgTabs, formatINR, monthOverMonth } from '../components/org-ui/OrgPageKit'
import { PayrollArt } from '../components/org-ui/OrgIllustrations'
import DataTable from '@shared/components/DataTable'
import Modal from '@shared/components/Modal'
import StatusBadge from '@shared/components/StatusBadge'
import { TableSkeleton } from '@shared/ui/Skeleton'
import { employeeService } from '@shared/services/employeeService'
import { getApiErrorMessage } from '@shared/services/apiServices'

const TABS = [['overview','Overview'],['structures','Salary Structure'],['salaries','Employee Salary'],['monthly','Monthly Payroll'],['payslips','Payslips']]
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
const number = (source, ...keys) => { for (const key of keys) { const value = Number(source?.[key]); if (Number.isFinite(value)) return value } return 0 }
const nameOf = (employee) => [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.name || '—'
const idOf = (employee) => employee.employeeCode ?? employee.employeeId ?? employee.id ?? '—'
const departmentOf = (employee) => employee.departmentName ?? employee.department?.name ?? employee.department ?? '—'
const branchOf = (employee) => employee.branchName ?? employee.branch?.name ?? employee.branch ?? '—'
const designationOf = (employee) => employee.designation ?? employee.role ?? '—'
const salarySource = (employee) => employee.salaryDetails ?? employee.salaryStructureDetails ?? employee.compensation ?? employee
const payrollSource = (employee) => employee.payroll ?? employee.monthlyPayroll ?? employee.payrollRecord
const hasSalary = (employee) => { const source = salarySource(employee); return Boolean(employee.salaryStructure || employee.salaryStructureName || source.basicSalary || source.grossSalary || source.netSalary) }
const hasPayroll = (employee) => Boolean(payrollSource(employee))

function salaryOf(employee) {
  const source = salarySource(employee)
  const basic = number(source, 'basicSalary', 'basic')
  const allowances = number(source, 'allowances', 'totalAllowances')
  const bonus = number(source, 'bonus', 'bonuses')
  const incentive = number(source, 'incentive', 'incentives')
  const deductions = number(source, 'deductions', 'totalStandardDeductions')
  const tax = number(source, 'tds', 'tax', 'taxDeductions', 'otherDeductions')
  return { basic, allowances, bonus, incentive, deductions, tax, gross: number(source, 'grossSalary', 'gross', 'grossEarnings'), net: number(source, 'netSalary', 'net', 'netPay') }
}

function recordOf(employee) {
  const source = payrollSource(employee) ?? {}
  const salary = salaryOf(source)
  return {
    employee: nameOf(employee), employeeId: idOf(employee), department: departmentOf(employee), branch: branchOf(employee), designation: designationOf(employee),
    structure: employee.salaryStructureName ?? employee.salaryStructure ?? source.salaryStructureName ?? '—', ...salary,
    month: source.payrollMonth ?? source.month ?? '—', workingDays: number(source, 'workingDays'), presentDays: number(source, 'presentDays', 'daysPresent'),
    paidLeave: number(source, 'paidLeaveDays', 'paidLeaves'), unpaidLeave: number(source, 'unpaidLeaveDays', 'unpaidLeaves'),
    attendanceAdjustment: number(source, 'attendanceAdjustment'), leaveAdjustment: number(source, 'leaveAdjustment'),
    totalDeductions: number(source, 'totalDeductions') || salary.deductions + salary.tax,
    netSalary: number(source, 'netSalary', 'netPay') || salary.net,
    status: source.payrollStatus ?? source.status ?? 'Not generated', payslipStatus: source.payslipStatus ?? employee.payslipStatus ?? 'Not generated',
  }
}

const employeeCell = (row) => <div><p className="text-sm font-bold text-slate-900 dark:text-white">{row.employee}</p><p className="text-xs text-slate-500">{row.employeeId} · {row.department}</p></div>
const amountColumn = (header, key, tone = '') => ({ header, accessor: key, render: (row) => <span className={`text-sm font-semibold ${tone}`}>{money(row[key])}</span> })
const statusBadge = (status) => <StatusBadge status={status === 'Finalized' || status === 'Active' || status === 'Generated' ? 'success' : status === 'Processed' || status === 'Approved' ? 'active' : 'pending'} label={status} size="sm" />

const DISTRIBUTION_PERIODS = [['month', 'This Month'], ['quarter', 'Last 3 Months'], ['year', 'This Year'], ['all', 'All Time']]

function inPeriod(monthLabel, period) {
  if (period === 'all') return true
  const date = new Date(monthLabel)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  const diff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
  if (period === 'month') return diff === 0
  if (period === 'quarter') return diff >= 0 && diff < 3
  return date.getFullYear() === now.getFullYear()
}

function Overview({ employees, records, onNavigate }) {
  const [period, setPeriod] = useState('month')
  const salaries = employees.filter(hasSalary).map(salaryOf)
  const sum = (key) => salaries.reduce((total, item) => total + item[key], 0)
  const recordTrend = (key) => monthOverMonth(records, (row) => row.month, () => true, (row) => row[key])
  const cards = [
    { icon: Users, tone: 'blue', label: 'Total Employees', value: employees.length, trend: 0 },
    { icon: FileText, tone: 'orange', label: 'Salary Structures', value: salaries.length, trend: 0 },
    { icon: IndianRupee, tone: 'purple', label: 'Gross Payroll', value: money(sum('gross')), trend: recordTrend('gross') },
    { icon: Wallet, tone: 'green', label: 'Allowances', value: money(sum('allowances')), trend: recordTrend('allowances') },
    { icon: TrendingUp, tone: 'orange', label: 'Bonuses', value: money(sum('bonus')), trend: recordTrend('bonus') },
    { icon: TrendingUp, tone: 'orange', label: 'Incentives', value: money(sum('incentive')), trend: recordTrend('incentive') },
    { icon: PieChart, tone: 'green', label: 'Deductions', value: money(sum('deductions') + sum('tax')), trend: recordTrend('totalDeductions'), invert: true },
    { icon: IndianRupee, tone: 'amber', label: 'Net Payroll', value: money(sum('net')), trend: recordTrend('netSalary') },
  ]
  const current = records[0]
  const currentStatus = current?.status ?? 'Not generated'
  const generated = Boolean(current) && currentStatus !== 'Not generated'

  const generatePayroll = () => {
    if (!salaries.length) {
      toast.error('Assign a salary structure to at least one employee before generating payroll.')
      onNavigate('structures')
      return
    }
    onNavigate('monthly')
  }

  const recent = records.slice(0, 5)
  const distribution = useMemo(() => {
    const groups = new Map()
    records.filter((row) => inPeriod(row.month, period)).forEach((row) => {
      const key = row.department && row.department !== '—' ? row.department : 'Unassigned'
      groups.set(key, (groups.get(key) ?? 0) + Number(row.netSalary || 0))
    })
    const rows = [...groups.entries()].map(([label, value]) => ({ label, value })).filter((row) => row.value > 0).sort((a, b) => b.value - a.value)
    const max = rows[0]?.value ?? 0
    return rows.map((row) => ({ ...row, pct: max ? Math.max(4, Math.round((row.value / max) * 100)) : 0 }))
  }, [records, period])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section className="kx-grid kx-grid--4" aria-label="Payroll summary">
        {cards.map((card) => <OrgKpiCard key={card.label} icon={card.icon} tone={card.tone} label={card.label} value={card.value} trend={card.trend} trendInvert={card.invert} />)}
      </section>

      <OrgPanel
        icon={CalendarDays}
        title="Current Payroll Period"
        action={<button type="button" className="kx-btn kx-btn--primary kx-btn--lg" onClick={generatePayroll}><Play aria-hidden="true" fill="currentColor" />{generated ? 'View Payroll' : 'Generate Payroll'}</button>}
      >
        <div className="kx-meta" style={{ paddingLeft: 56, marginTop: -8 }}>
          <div><p className="kx-meta__label">Period</p><p className="kx-meta__value">{current?.month && current.month !== '—' ? current.month : 'No period available'}</p></div>
          <div><p className="kx-meta__label">Status</p><div style={{ marginTop: 4 }}>{generated ? statusBadge(currentStatus) : <span className="kx-status kx-status--warn" style={{ height: 26, fontSize: 13 }}><span className="kx-status__dot" aria-hidden="true" style={{ width: 7, height: 7 }} />Not generated</span>}</div></div>
          <div><p className="kx-meta__label">Payroll records</p><p className="kx-meta__value">{records.length}</p></div>
        </div>
        {!salaries.length && (
          <div className="kx-note kx-note--warn" style={{ marginTop: 16 }}>
            <Info aria-hidden="true" />
            <span>No salary structures are assigned to the organization employees returned by the API.</span>
          </div>
        )}
      </OrgPanel>

      <div className="kx-grid kx-grid--main">
        <OrgPanel icon={FileText} title="Recent Payroll Activity" action={records.length ? <button type="button" className="kx-link" onClick={() => onNavigate('monthly')}>View all</button> : <span className="kx-link" style={{ opacity: .5 }}>View all</span>}>
          {recent.length ? (
            <div className="kx-table-wrap">
              <table className="kx-table" style={{ minWidth: 520 }}>
                <thead><tr><th>Employee</th><th>Month</th><th>Net Salary</th><th>Status</th></tr></thead>
                <tbody>
                  {recent.map((row, index) => (
                    <tr key={`${row.employeeId}-${index}`}>
                      <td><span className="kx-strong">{row.employee}</span><span className="kx-cell-sub">{row.employeeId} · {row.department}</span></td>
                      <td>{row.month}</td>
                      <td className="kx-num kx-strong">{formatINR(row.netSalary)}</td>
                      <td>{statusBadge(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <OrgEmpty icon={CreditCard} title="No payroll records yet" text="Generate a payroll to see recent activity here." action={<button type="button" className="kx-btn kx-btn--soft" onClick={generatePayroll}><Play aria-hidden="true" />Generate Payroll</button>} />
          )}
        </OrgPanel>

        <OrgPanel icon={BarChart3} tone="green" title="Salary Distribution" action={<OrgSelect compact auto label="Distribution period" value={period} onChange={setPeriod} options={DISTRIBUTION_PERIODS} />}>
          {distribution.length ? (
            <div className="kx-bars">
              {distribution.map((row) => (
                <div key={row.label}>
                  <div className="kx-bar__head"><span>{row.label}</span><span className="kx-num">{formatINR(row.value)}</span></div>
                  <div className="kx-bar__track"><div className="kx-bar__fill" style={{ width: `${row.pct}%` }} /></div>
                </div>
              ))}
            </div>
          ) : (
            <OrgEmpty icon={BarChart3} title="No data available" text="Generate payroll to see salary distribution." />
          )}
        </OrgPanel>
      </div>
    </div>
  )
}

function Structures({ employees }) {
  const data = employees.filter(hasSalary).map((employee) => ({ employee: employee.salaryStructureName ?? employee.salaryStructure ?? nameOf(employee), employeeId: idOf(employee), department: departmentOf(employee), ...salaryOf(employee), status: employee.salaryStatus ?? employee.status ?? 'Active' }))
  const columns = [{header:'Structure Name',accessor:'employee',render:employeeCell},amountColumn('Basic Salary','basic'),amountColumn('Allowances','allowances'),amountColumn('Deductions','deductions','text-red-600'),amountColumn('Bonuses','bonus','text-emerald-600'),amountColumn('Incentives','incentive','text-emerald-600'),amountColumn('Tax / Other','tax','text-red-600'),amountColumn('Gross Salary','gross'),amountColumn('Net Salary','net','text-blue-600'),{header:'Status',accessor:'status',render:(row)=>statusBadge(row.status)}]
  return <DataTable columns={columns} data={data} searchPlaceholder="Search salary structures..." pageSize={10} emptyTitle="No salary structures found" emptyDescription="No salary configuration was returned for this organization." emptyIcon={CreditCard}/>
}

function Salaries({ employees }) {
  const data = employees.filter(hasSalary).map((employee) => ({ employee:nameOf(employee),employeeId:idOf(employee),department:departmentOf(employee),branch:branchOf(employee),designation:designationOf(employee),structure:employee.salaryStructureName ?? employee.salaryStructure ?? '—',...salaryOf(employee),status:employee.salaryStatus ?? employee.status ?? 'Active' }))
  const columns = [{header:'Employee',accessor:'employee',render:employeeCell},{header:'Branch',accessor:'branch'},{header:'Designation',accessor:'designation'},{header:'Structure',accessor:'structure'},amountColumn('Basic','basic'),amountColumn('Allowances','allowances'),amountColumn('Bonus','bonus'),amountColumn('Incentive','incentive'),amountColumn('Deductions','deductions','text-red-600'),amountColumn('Tax','tax','text-red-600'),amountColumn('Gross','gross'),amountColumn('Net Salary','net','text-blue-600'),{header:'Status',accessor:'status',render:(row)=>statusBadge(row.status)}]
  return <DataTable columns={columns} data={data} searchPlaceholder="Search employee name, ID, or department..." pageSize={10} emptyTitle="No employee salary records found" emptyDescription="No salary structure is assigned to these employees." emptyIcon={Users}/>
}

function Monthly({ records }) {
  const [month, setMonth] = useState('all');
  const calendarPeriods = useMemo(() => Array.from({ length: 12 }, (_, offset) => { const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - offset); return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }), []);
  const months = [...new Set([...records.map((row)=>row.month).filter((value)=>value && value !== '—'), ...calendarPeriods])];
  const data = month === 'all' ? records : records.filter((row)=>row.month === month)
  const columns = [{header:'Employee',accessor:'employee',render:employeeCell},{header:'Payroll Month',accessor:'month'},amountColumn('Basic','basic'),amountColumn('Allowances','allowances'),amountColumn('Bonus','bonus'),amountColumn('Incentive','incentive'),amountColumn('Gross','gross'),amountColumn('Attendance','attendanceAdjustment','text-amber-600'),amountColumn('Leave','leaveAdjustment','text-amber-600'),amountColumn('Deductions','deductions','text-red-600'),amountColumn('Tax / Other','tax','text-red-600'),amountColumn('Total Deductions','totalDeductions','text-red-600'),amountColumn('Net Salary','netSalary','text-blue-600'),{header:'Status',accessor:'status',render:(row)=>statusBadge(row.status)}]
  return <div className="space-y-4"><div className="flex items-center gap-3"><label className="text-xs font-bold text-slate-600">Payroll Month</label><select value={month} onChange={(event)=>setMonth(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">All periods</option>{months.map((item)=><option key={item}>{item}</option>)}</select></div><DataTable columns={columns} data={data} searchPlaceholder="Search employee name or department..." pageSize={10} emptyTitle="No payroll has been generated for this period" emptyDescription="Monthly payroll will appear when returned by the payroll service." emptyIcon={CreditCard}/></div>
}

function Payslips({ records }) {
  const [viewing,setViewing] = useState(null); const data = records.filter((row)=>row.payslipStatus !== 'Not generated')
  const columns = [{header:'Employee',accessor:'employee',render:employeeCell},{header:'Payroll Month',accessor:'month'},amountColumn('Gross Salary','gross'),amountColumn('Total Deductions','totalDeductions','text-red-600'),amountColumn('Net Salary','netSalary','text-blue-600'),{header:'Payroll Status',accessor:'status',render:(row)=>statusBadge(row.status)},{header:'Payslip Status',accessor:'payslipStatus',render:(row)=>statusBadge(row.payslipStatus)},{header:'Actions',sortable:false,render:(row)=><button onClick={()=>setViewing(row)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600"><Eye className="h-3.5 w-3.5"/>View</button>}]
  return <><DataTable columns={columns} data={data} searchPlaceholder="Search employee name or ID..." pageSize={10} emptyTitle="No payslips found" emptyDescription="No payslips have been generated for the available payroll periods." emptyIcon={FileText}/><Modal open={Boolean(viewing)} onClose={()=>setViewing(null)} title="Payslip Details" size="lg">{viewing && <Payslip row={viewing}/>}</Modal></>
}

function Payslip({ row }) { const earnings=[['Basic Salary',row.basic],['Allowances',row.allowances],['Bonus',row.bonus],['Incentive',row.incentive]]; const deductions=[['Attendance Adjustment',row.attendanceAdjustment],['Leave Adjustment',row.leaveAdjustment],['Deductions',row.deductions],['Tax / Other',row.tax]]; return <div className="space-y-5"><div className="flex items-center justify-between border-b pb-4"><div className="brand-logo-viewport flex h-12 w-40 items-center justify-center"><img src="/assets/new-logo-f.jpg.jpeg" alt="Kini — Learn. Innovate. Lead." className="brand-logo-image"/></div><div className="text-right"><p className="text-xl font-black">PAYSLIP</p><p className="text-xs text-slate-500">{row.month}</p></div></div><div><p className="font-bold">{row.employee}</p><p className="text-sm text-slate-500">{row.employeeId} · {row.department} · {row.designation}</p></div><Breakdown title="Earnings" items={earnings} totalLabel="Gross Earnings" total={row.gross}/><Breakdown title="Deductions" items={deductions} totalLabel="Total Deductions" total={row.totalDeductions} negative/><div className="flex justify-between rounded-xl bg-blue-50 p-4 font-extrabold text-blue-700"><span>NET SALARY</span><span>{money(row.netSalary)}</span></div></div> }
function Breakdown({title,items,totalLabel,total,negative=false}) { return <div><h3 className={`mb-2 text-sm font-bold ${negative?'text-red-600':'text-emerald-600'}`}>{title.toUpperCase()}</h3><div className="overflow-hidden rounded-xl border border-slate-200">{items.map(([label,value])=><div key={label} className="flex justify-between border-b px-4 py-2 text-sm"><span>{label}</span><span>{negative?'-':''}{money(value)}</span></div>)}<div className="flex justify-between bg-slate-50 px-4 py-3 font-bold"><span>{totalLabel}</span><span>{money(total)}</span></div></div></div> }

export default function PayrollApiReady() {
  const [tab,setTab]=useState('overview'); const [employees,setEmployees]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
  const load=useCallback(async()=>{setLoading(true);setError('');try{const result=await employeeService.getEmployees({pageNumber:1,pageSize:1000});setEmployees(Array.isArray(result?.data)?result.data:[])}catch(reason){setError(getApiErrorMessage(reason,'Unable to load payroll data.'))}finally{setLoading(false)}},[])
  useEffect(()=>{load()},[load]); const records=useMemo(()=>employees.filter(hasPayroll).map(recordOf),[employees])
  return (
    <OrgPage className="payroll-management-page">
      <OrgHero
        icon={Database}
        title="Salary & Payroll"
        subtitle="Manage salary structures, monthly payroll and employee payslips."
        tagline="Empower Your Team, Build a Brighter Future"
        taglineStyle="italic"
        art={<PayrollArt />}
        motto={['People', 'Process', 'Progress']}
        quote={['Fair Pay', 'Happier Teams', 'Stronger Tomorrow']}
        quoteStyle="card"
      />
      <OrgTabs tabs={TABS} active={tab} onChange={setTab} label="Payroll sections" />
      {error && (
        <div className="kx-note kx-note--error" role="alert">
          <AlertCircle aria-hidden="true" />
          <span><strong>Unable to load payroll data.</strong> {error}</span>
          <button type="button" onClick={load} className="kx-note__action"><RefreshCw width={15} height={15} aria-hidden="true" />Retry</button>
        </div>
      )}
      {loading ? <TableSkeleton rows={5} columns={6}/> : tab==='overview' ? <Overview employees={employees} records={records} onNavigate={setTab}/> : <div className="kx-panel">{tab==='structures'?<Structures employees={employees}/>:tab==='salaries'?<Salaries employees={employees}/>:tab==='monthly'?<Monthly records={records}/>:<Payslips records={records}/>}</div>}
    </OrgPage>
  )
}
