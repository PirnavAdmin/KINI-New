 
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Users, Eye, Edit3, X, Activity,
  UserPlus, UserMinus, Mail, Phone,
  Building2, Layers, Briefcase, Star, Plus, Trash2
} from 'lucide-react'
import { KPICard } from '@shared/components/SharedComponents'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Button, Input, Select } from '@shared/components/FormElements'
import { employeeApi, getApiErrorMessage } from '@shared/services/apiServices'
 
// =================================
// TODO: API Integration
// GET /api/v1/super-admin/employees
// GET /api/v1/super-admin/employees/stats
// GET /api/v1/super-admin/employees/:id
// DELETE /api/v1/super-admin/employees/:id
// =================================
 
export default function SuperAdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [deptFilter, setDeptFilter] = useState('')
  const [orgFilter, setOrgFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [saving, setSaving] = useState(false)
  const emptyForm = { firstName: '', lastName: '', email: '', phone: '', departmentId: '', branchId: '', designation: '', status: 'Active' }
  const [form, setForm] = useState(emptyForm)

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const rows = await employeeApi.list()
      setEmployees((Array.isArray(rows) ? rows : []).map((employee) => ({
          ...employee,
          id: employee.employeeId ?? employee.id,
          employeeId: employee.employeeId ?? employee.id,
          name: [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.email,
          email: employee.email,
          phone: employee.phone,
          organization: employee.organizationName || 'Organization',
          department: employee.departmentName || `Department ${employee.departmentId || '-'}`,
          designation: employee.designation || '-',
          status: employee.status || 'Active',
          joiningDate: employee.joiningDate || '-',
          manager: employee.managerName || '-',
          skills: employee.skills || [],
          performance: employee.performanceScore || 0,
        })))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load employees'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchEmployees, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const openCreate = () => {
    setEditingEmployee(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditingEmployee(row)
    setForm({
      firstName: row.firstName || row.name?.split(' ')[0] || '',
      lastName: row.lastName || row.name?.split(' ').slice(1).join(' ') || '',
      email: row.email || '', phone: row.phone || '',
      departmentId: row.departmentId || '', branchId: row.branchId || '',
      designation: row.designation || '', status: row.status || 'Active',
    })
    setFormOpen(true)
  }

  const saveEmployee = async (event) => {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.departmentId || !form.branchId) {
      toast.error('First name, last name, email, department and branch are required')
      return
    }
    setSaving(true)
    try {
      if (editingEmployee) await employeeApi.update(editingEmployee.employeeId, form)
      else await employeeApi.create(form)
      toast.success(editingEmployee ? 'Employee updated' : 'Employee added')
      setFormOpen(false)
      await fetchEmployees()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save employee'))
    } finally {
      setSaving(false)
    }
  }

  const deleteEmployee = async (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return
    try {
      await employeeApi.remove(row.employeeId)
      setEmployees((items) => items.filter((item) => item.employeeId !== row.employeeId))
      setModalOpen(false)
      toast.success('Employee deleted')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete employee'))
    }
  }
 
  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchDept = !deptFilter || e.department === deptFilter
      const matchOrg = !orgFilter || e.organization === orgFilter
      const matchStatus = !statusFilter || e.status === statusFilter
      return matchDept && matchOrg && matchStatus
    })
  }, [employees, deptFilter, orgFilter, statusFilter])
 
  const columns = [
    {
      header: 'Employee',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand/10 to-teal/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand">
              {row.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Organization',
      accessor: 'organization',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600 dark:text-slate-300">{row.organization}</span>
        </div>
      ),
    },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    { header: 'Joined', accessor: 'joiningDate' },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedEmployee(row); setModalOpen(true) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="View employee"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-brand" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(row) }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Edit employee">
            <Edit3 className="w-3.5 h-3.5 text-slate-400 hover:text-brand" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); deleteEmployee(row) }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" aria-label="Delete employee">
            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
          </button>
        </div>
      ),
    },
  ]
 
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'trial', label: 'Trial' },
    { value: 'completed', label: 'Completed' },
  ]
 
  return (
    <div className="w-full p-2 sm:p-3 lg:p-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard dense icon={Users} label="Total Employees" value={employees.length} color="#0f55f7" delay={0} />
        <KPICard dense icon={Activity} label="Active Employees" value={employees.filter((item) => item.status?.toLowerCase() === 'active').length} color="#06b6a8" delay={1} />
        <KPICard dense icon={UserPlus} label="With Department" value={employees.filter((item) => item.departmentId).length} color="#0f55f7" delay={2} />
        <KPICard dense icon={UserMinus} label="Inactive" value={employees.filter((item) => item.status?.toLowerCase() !== 'active').length} color="#EF4444" delay={3} />
      </div>
 
      {/* Header */}
      <PageHeader
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-5"
        title="All Employees"
        subtitle="View and manage employees across all organizations"
        icon={Users}
        actions={<Button icon={Plus} onClick={openCreate}>Add Employee</Button>}
      />
 
      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={10}
        searchPlaceholder="Search employees by name, email, or organization..."
        emptyTitle="No employees found"
        emptyDescription="Try adjusting your search or filters."
        emptyIcon={Users}
        onRowClick={(row) => { setSelectedEmployee(row); setModalOpen(true) }}
        filters={
          <div className="flex gap-2 flex-wrap">
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">All Organizations</option>
              {[...new Set(employees.map((item) => item.organization))].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">All Departments</option>
              {[...new Set(employees.map((item) => item.department))].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {statusOptions.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        }
      />
 
      {/* Employee Profile Modal */}
      <AnimatePresence>
        {modalOpen && selectedEmployee && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-4 sm:inset-auto sm:top-[5%] sm:left-1/2 sm:-translate-x-1/2 w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/10 to-teal/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-teal dark:text-teal-300">{selectedEmployee.name}</h2>
                    <p className="text-sm text-slate-400">{selectedEmployee.designation}</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
 
              {/* Tabs Content */}
              <div className="overflow-y-auto p-6">
                {/* Tab Navigation */}
                <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                  {['Personal', 'Employment', 'Skills', 'Performance'].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        tab === 'Personal'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
 
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Full Name', value: selectedEmployee.name, icon: Users },
                    { label: 'Email Address', value: selectedEmployee.email, icon: Mail },
                    { label: 'Phone', value: selectedEmployee.phone || '—', icon: Phone },
                    { label: 'Employee ID', value: String(selectedEmployee.id).toUpperCase(), icon: Briefcase },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-xs text-slate-400">{item.label}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
 
                {/* Employment */}
                <h3 className="text-sm font-semibold text-teal dark:text-teal-300 uppercase tracking-wider mb-3">Employment Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Organization', value: selectedEmployee.organization, icon: Building2 },
                    { label: 'Department', value: selectedEmployee.department, icon: Layers },
                    { label: 'Designation', value: selectedEmployee.designation, icon: Briefcase },
                    { label: 'Reporting Manager', value: selectedEmployee.manager, icon: Users },
                    { label: 'Joining Date', value: selectedEmployee.joiningDate, icon: Activity },
                    { label: 'Status', value: <StatusBadge status={selectedEmployee.status} />, icon: Activity },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-xs text-slate-400">{item.label}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
 
                {/* Skills */}
                <h3 className="text-sm font-semibold text-teal dark:text-teal-300 uppercase tracking-wider mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(selectedEmployee.skills || []).map((skill) => (
                    <span key={skill} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0f55f7]/10 text-brand border border-[#0f55f7]/20">
                      {skill}
                    </span>
                  ))}
                </div>
 
                {/* Performance */}
                <h3 className="text-sm font-semibold text-teal dark:text-teal-300 uppercase tracking-wider mb-3">Performance</h3>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-100 dark:border-amber-500/10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{selectedEmployee.performance}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Performance Score</p>
                      <p className="text-xs text-slate-400">Overall rating across all reviews</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(selectedEmployee.performance / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        description="Save employee details through the organization API"
        size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button loading={saving} onClick={saveEmployee}>{editingEmployee ? 'Update' : 'Add Employee'}</Button></div>}
      >
        <form onSubmit={saveEmployee} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Department ID" type="number" required value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} />
          <Input label="Branch ID" type="number" required value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} />
          <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} placeholder="" />
          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </Modal>
    </div>
  )
}
