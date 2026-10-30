import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Building2, Edit3, Eye, Mail, MapPin, Phone, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Card from '@shared/components/Card'
import DataTable from '@shared/components/DataTable'
import Modal from '@shared/components/Modal'
import StatusBadge from '@shared/components/StatusBadge'
import { Button, Input } from '@shared/components/FormElements'
import { addBranch, editBranch, fetchBranchById, fetchBranches, getBranchErrorMessage, removeBranch } from '@shared/services/organizationService'
import { readStoredOrganizationId } from '@shared/services/apiServices'

const EMPTY = { organizationId:'', name:'', address:'', city:'', country:'', phone:'', email:'' }
const txt = (v) => String(v ?? '').trim()
const phoneValue = (v) => txt(v).replace(/\D/g, '').slice(0, 10)
const VALID_BRANCH_PHONE = /^[6-9]\d{9}$/
const BRANCH_PHONE_ERROR = 'Enter a valid Indian mobile number starting with 6, 7, 8, or 9.'
const firstBranchText = (...values) => values.map(txt).find(Boolean) || ''
const branchPhone = (b = {}) => firstBranchText(b.phone, b.Phone, b.mobile, b.Mobile, b.mobileNumber, b.MobileNumber, b.phoneNumber, b.PhoneNumber, b.primaryPhone, b.PrimaryPhone, b.contact, b.Contact, b.contactNo, b.ContactNo, b.contactPhone, b.ContactPhone, b.contactNumber, b.ContactNumber, b.branchContact, b.BranchContact, b.branchContactNumber, b.BranchContactNumber, b.branchContactPhone, b.BranchContactPhone, b.branchPhone, b.BranchPhone, b.branchPhoneNumber, b.BranchPhoneNumber, b.branchMobile, b.BranchMobile, b.branchMobileNumber, b.BranchMobileNumber)
const branchEmail = (b = {}) => firstBranchText(b.email, b.Email, b.emailAddress, b.EmailAddress, b.primaryEmail, b.PrimaryEmail, b.contactEmail, b.ContactEmail, b.contactMail, b.ContactMail, b.branchEmail, b.BranchEmail, b.branchContactEmail, b.BranchContactEmail)
const show = (v) => txt(v) || '—'
const statusOf = (v) => txt(v).toLowerCase() === 'inactive' ? 'inactive' : 'active'
const DEMO_BRANCHES = [
  {branchId:1,name:'Hyderabad Main Branch',branchCode:'BR-HYD-001',address:'Madhapur, Hyderabad, Telangana',phone:'9848012345',email:'hyderabad@kinieduhub.io',managerId:201,managerName:'Rahul Kumar',status:'active'},
  {branchId:2,name:'Bengaluru Technology Center',branchCode:'BR-BLR-002',address:'Whitefield, Bengaluru, Karnataka',phone:'9848023456',email:'bengaluru@kinieduhub.io',managerId:202,managerName:'Priya Sharma',status:'active'},
  {branchId:3,name:'Chennai Learning Hub',branchCode:'BR-CHE-003',address:'Velachery, Chennai, Tamil Nadu',phone:'9848034567',email:'chennai@kinieduhub.io',managerId:203,managerName:'Neha Verma',status:'active'},
  {branchId:4,name:'Mumbai Corporate Branch',branchCode:'BR-MUM-004',address:'Andheri East, Mumbai, Maharashtra',phone:'9848045678',email:'mumbai@kinieduhub.io',managerId:204,managerName:'Arjun Kapoor',status:'inactive'},
]

export default function OrgBranches() {
  const [branches,setBranches]=useState([])
  const [loading,setLoading]=useState(true), [saving,setSaving]=useState(false), [error,setError]=useState('')
  const [statusFilter,setStatusFilter]=useState('all')
  const [formOpen,setFormOpen]=useState(false), [details,setDetails]=useState(null), [editing,setEditing]=useState(null)
  const [detailsLoading,setDetailsLoading]=useState(false), [detailsError,setDetailsError]=useState('')
  const [form,setForm]=useState(EMPTY), [errors,setErrors]=useState({}), [deleting,setDeleting]=useState(false)
  const [deleteTarget,setDeleteTarget]=useState(null)

  const loadSequence = useRef(0)
  const mutationPending = useRef(false)
  const load = useCallback(async ({ rethrow = false } = {}) => {
    const sequence = ++loadSequence.current
    setLoading(true)
    setError('')
    try {
      const result = localStorage.getItem('isDemo') === 'true' ? [...DEMO_BRANCHES] : await fetchBranches()
      if (sequence !== loadSequence.current) return null
      const rows = Array.isArray(result) ? result : []
      setBranches(rows)
      return rows
    } catch (e) {
      if (sequence !== loadSequence.current) return null
      setError(getBranchErrorMessage(e))
      if (rethrow) throw new Error(`The branch request completed, but refreshing the list failed: ${getBranchErrorMessage(e)}`, { cause: e })
      return null
    } finally {
      if (sequence === loadSequence.current) setLoading(false)
    }
  }, [])
  useEffect(() => {
    // Loading synchronizes this page with the external branch API on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    return () => { loadSequence.current += 1 }
  }, [load])

  const filtered=useMemo(()=>(Array.isArray(branches)?branches:[]).filter(Boolean).filter(b=>(statusFilter==='all'||statusOf(b.status)===statusFilter)),[branches,statusFilter])
  const stats=useMemo(()=>{const safeBranches=(Array.isArray(branches)?branches:[]).filter(Boolean);return{total:safeBranches.length,active:safeBranches.filter(b=>statusOf(b.status)==='active').length,inactive:safeBranches.filter(b=>statusOf(b.status)==='inactive').length}},[branches])

  const openAdd=()=>{setEditing(null);setErrors({});setForm({...EMPTY,organizationId:readStoredOrganizationId()||''});setFormOpen(true)}
  const openEdit=(b)=>{setEditing(b);setErrors({});setForm({organizationId:b.organizationId||readStoredOrganizationId()||'',name:txt(b.name||b.branchName),address:txt(b.address),city:txt(b.city),country:txt(b.country),phone:phoneValue(branchPhone(b)),email:txt(branchEmail(b))});setFormOpen(true)}
  const openDetails=async(b)=>{const id=b?.branchId??b?.id;setDetails(b);setDetailsError('');if(localStorage.getItem('isDemo')==='true')return;setDetailsLoading(true);try{setDetails(await fetchBranchById(id))}catch(e){setDetailsError(getBranchErrorMessage(e))}finally{setDetailsLoading(false)}}
  const update=(key)=>(e)=>{const value=key==='phone'?phoneValue(e.target.value):e.target.value;setForm(v=>({...v,[key]:value}));setErrors(v=>({...v,[key]:key==='phone'&&value&&!VALID_BRANCH_PHONE.test(value)?BRANCH_PHONE_ERROR:''}))}
  const validate=()=>{const e={};if(!form.name.trim())e.name='Branch name is required';if(!form.address.trim())e.address='Address is required';if(!form.city.trim())e.city='City is required';if(!form.country.trim())e.country='Country is required';if(!VALID_BRANCH_PHONE.test(form.phone.trim()))e.phone=BRANCH_PHONE_ERROR;if(!/^\S+@\S+\.\S+$/.test(form.email.trim()))e.email='Please enter a valid email address';setErrors(e);return !Object.keys(e).length}
  const save = async () => {
    if (mutationPending.current || !validate()) return
    mutationPending.current = true
    setSaving(true)
    try {
      const payload = {organizationId:form.organizationId||readStoredOrganizationId(),name:form.name.trim(),address:form.address.trim(),city:form.city.trim(),country:form.country.trim(),phone:phoneValue(form.phone),email:form.email.trim()}
      if (!payload.organizationId) throw new Error('Your session does not include a valid organization ID. Please sign in again.')
      const demo = localStorage.getItem('isDemo') === 'true'
      if (demo) {
        if (editing) {
          const index = DEMO_BRANCHES.findIndex(b => b.branchId === (editing.branchId ?? editing.id))
          if (index >= 0) DEMO_BRANCHES[index] = {...DEMO_BRANCHES[index], ...payload}
        } else DEMO_BRANCHES.unshift({...payload, branchId:Date.now()})
      } else if (editing) await editBranch(editing.branchId ?? editing.id, payload)
      else await addBranch(payload)
      setFormOpen(false)
      const rows = await load({ rethrow: true })
      if (rows) toast.success(`${demo ? 'Demo branch' : 'Branch'} ${editing ? 'updated' : 'added'} successfully`)
    } catch (e) {
      toast.error(getBranchErrorMessage(e))
    } finally {
      mutationPending.current = false
      setSaving(false)
    }
  }
  const confirmRemove=async()=>{
    const b=deleteTarget
    if(!b||mutationPending.current)return
    const id=b?.branchId??b?.id
    if(id===undefined||id===null||id===''){toast.error('A valid branch ID is required.');return}
    mutationPending.current=true
    setDeleting(true)
    try{
      if(localStorage.getItem('isDemo')==='true'){const index=DEMO_BRANCHES.findIndex(item=>(item.branchId??item.id)===id);if(index>=0)DEMO_BRANCHES.splice(index,1)}else await removeBranch(id)
      setDetails(null);setDeleteTarget(null)
      const rows = await load({ rethrow: true })
      if (rows?.some(row => String(row.branchId ?? row.id) === String(id))) {
        throw new Error('The server still returns this branch after deletion. Refresh the list or contact support.')
      }
      if (rows) toast.success('Branch deleted successfully')
    }catch(e){toast.error(getBranchErrorMessage(e))}finally{mutationPending.current=false;setDeleting(false)}
  }

  const columns=[
    {header:'Branch',accessor:'name',minWidth:190,render:b=><div><p className="font-bold text-slate-900 dark:text-white">{show(b.name||b.branchName)}</p><p className="mt-0.5 text-xs text-slate-400">{show([b.city,b.country].filter(Boolean).join(', '))}</p></div>},
    {header:'Address',accessor:'address',minWidth:220,render:b=><span className="flex max-w-[260px] items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"/>{show(b.address)}</span>},
    {header:'Contact',accessor:'phone',minWidth:145,render:b=>show(branchPhone(b))},
    {header:'Email',accessor:'email',minWidth:210,render:b=><span className="break-all">{show(branchEmail(b))}</span>},
    {header:'Status',accessor:'status',minWidth:105,render:b=><StatusBadge status={statusOf(b.status)} label={statusOf(b.status)==='active'?'Active':'Inactive'}/>},
    {header:'Actions',sortable:false,minWidth:150,render:b=><div className="flex gap-1" onClick={e=>e.stopPropagation()}><button type="button" onClick={()=>openDetails(b)} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-[#0f55f7]" aria-label="View branch"><Eye className="h-4 w-4"/></button><button type="button" onClick={()=>openEdit(b)} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-[#0f55f7]" aria-label="Edit branch"><Edit3 className="h-4 w-4"/></button><button type="button" onClick={()=>setDeleteTarget(b)} disabled={deleting} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label="Delete branch"><Trash2 className="h-4 w-4"/></button></div>},
  ]

  const fields=details?[['Branch Name',details.name||details.branchName,Building2],['Address',details.address,MapPin],['City',details.city,MapPin],['Country',details.country,MapPin],['Phone',branchPhone(details),Phone],['Email',branchEmail(details),Mail]]:[]

  return <main className="w-full min-w-0 space-y-4 pb-6">
    <header className="flex flex-col gap-3 rounded-2xl border border-[#e7e2da] bg-[#fffefc] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#0f55f7]">Organization · Locations</p><h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Branch Management</h1><p className="mt-1 text-sm text-slate-500">Manage organization branches, branch managers, contact information, locations, and branch status.</p></div><Button onClick={openAdd} icon={Plus} className="shrink-0 self-start sm:self-auto">Add Branch</Button></header>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[['Total Branches',stats.total,Building2,'text-blue-600 bg-blue-50'],['Active Branches',stats.active,MapPin,'text-emerald-600 bg-emerald-50'],['Inactive Branches',stats.inactive,AlertCircle,'text-amber-600 bg-amber-50']].map(([label,value,Icon,color])=><Card key={label} padding="p-4" className="!border-slate-200 bg-white dark:!border-slate-700"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5"/></span><div><p className="text-2xl font-extrabold text-slate-950 dark:text-white">{value}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p></div></div></Card>)}</section>
    {error&&!loading?<section className="rounded-2xl border border-red-200 bg-white p-10 text-center dark:bg-slate-900"><AlertCircle className="mx-auto h-9 w-9 text-red-500"/><h2 className="mt-3 font-bold">Unable to load branches</h2><p className="mt-1 text-sm text-slate-500">{error}</p><Button className="mt-4" onClick={load} icon={RefreshCw}>Retry</Button></section>:<DataTable columns={columns} data={filtered} loading={loading} pageSize={8} searchPlaceholder="Search branches by name, city, country, or email..." onRowClick={openDetails} emptyTitle="No branches found" emptyDescription={statusFilter!=='all'?'Try changing the selected filter.':'Create your first branch to start managing organization locations.'} emptyIcon={Building2} emptyAction={statusFilter==='all'?<Button onClick={openAdd} icon={Plus}>Add Branch</Button>:undefined} filters={<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="all">All branches</option><option value="active">Active</option><option value="inactive">Inactive</option></select>}/>} 
    <Modal open={formOpen} onClose={()=>{if(!saving)setFormOpen(false)}} title={editing?'Edit Branch':'Add Branch'} description={editing?'Update the selected branch information.':'Create a branch for the current organization.'} size="lg" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={()=>setFormOpen(false)} disabled={saving}>Cancel</Button><Button onClick={save} loading={saving}>{editing?'Save Changes':'Save Branch'}</Button></div>}><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Input label="Organization ID" value={form.organizationId} readOnly disabled hint="Automatically selected from the current organization." /></div><Input label="Branch Name" required value={form.name} onChange={update('name')} error={errors.name} icon={Building2} autoComplete="off"/><Input label="Phone" type="tel" inputMode="numeric" maxLength={10} required value={form.phone} onChange={update('phone')} error={errors.phone} icon={Phone} autoComplete="tel"/><div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium">Address <span className="text-red-500">*</span></label><textarea rows={3} value={form.address} onChange={update('address')} className={`w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:bg-slate-800 ${errors.address?'border-red-500':'border-slate-200 dark:border-slate-700'}`}/>{errors.address&&<p className="mt-1 text-xs text-red-500">{errors.address}</p>}</div><Input label="City" required value={form.city} onChange={update('city')} error={errors.city} icon={MapPin}/><Input label="Country" required value={form.country} onChange={update('country')} error={errors.country} icon={MapPin}/><div className="sm:col-span-2"><Input label="Email" type="email" required value={form.email} onChange={update('email')} error={errors.email} icon={Mail} autoComplete="new-password"/></div></div></Modal>
    <Modal open={Boolean(deleteTarget)} onClose={()=>{if(!deleting)setDeleteTarget(null)}} title="Delete Branch" description={`Are you sure you want to delete ${deleteTarget?.name||'this branch'}? This action cannot be undone.`} size="sm" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={()=>setDeleteTarget(null)} disabled={deleting}>Cancel</Button><Button variant="danger" onClick={confirmRemove} icon={Trash2} loading={deleting}>Delete</Button></div>}/>
    <Modal open={Boolean(details)} onClose={()=>setDetails(null)} title="Branch Details" description={detailsLoading ? "Loading branch details..." : detailsError || "Organization branch information"} size="md" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={()=>setDetails(null)}>Close</Button><Button onClick={()=>{const b=details;setDetails(null);openEdit(b)}} icon={Edit3}>Edit Branch</Button></div>}><div className="grid gap-3 sm:grid-cols-2">{fields.map(([label,value,Icon])=><div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><Icon className="h-3.5 w-3.5"/>{label}</p><p className="mt-1 break-words text-sm font-semibold">{show(value)}</p></div>)}</div>{details&&<div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Status</p><StatusBadge status={statusOf(details.status)} label={statusOf(details.status)==='active'?'Active':'Inactive'}/></div>}</Modal>
  </main>
}
