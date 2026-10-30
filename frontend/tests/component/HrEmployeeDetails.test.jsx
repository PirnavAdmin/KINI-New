import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, configure, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import apiClient from '@shared/services/apiClient'
import HrApiModule from '@features/hr/components/HrApiModule'
import EmployeeDetails from '@features/hr/pages/EmployeeDetails'
import { employeeService } from '@shared/services/employeeService'
import { employeeIdOf, loadHrEmployeeDetails } from '@features/hr/services/hrEmployeeDetails'
vi.mock('@features/hr/components/HRPage', () => ({ default:({ children,hero }) => <main>{hero}{children}</main> }))
vi.mock('@features/hr/hooks/useHrPermissions', () => ({ default:() => ({ isHrUser:true, canAccessModule:() => true, isLoading:false }) }))
const access = vi.hoisted(() => ({ deny:null }))
vi.mock('@shared/services/apiClient', () => ({ default:{ request:vi.fn() } }))
vi.mock('@shared/services/employeeService', () => ({ employeeService:{ getEmployeeBatches:vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default:() => ({ hasPermission:key => key!==access.deny,can:() => true,isLoading:false }) }))
vi.mock('@features/hr/components/HrApiForm', () => ({ default:({ onSave }) => <div role="dialog"><button onClick={() => onSave({ firstName:'Updated' })}>Save Test Employee</button></div> }))
configure({ asyncUtilTimeout: 5000 })
const names = ['NANI NARYANA','Lahari Gandikota','nani narendraaaa','mohannarayana minchala','Prabha Sri','THAMMUDUu LAHARI','CHINNI LAHARI']
const employees=names.map((fullName,i) => ({ employeeId:9+i,userId:900+i,employeeCode:'EMP-'+(90+i),fullName,email:'employee'+i+'@example.com',role:i%2?'Mentor':'HR',status:'Active' }))
beforeEach(() => {
  access.deny=null;vi.clearAllMocks();HTMLElement.prototype.scrollTo=vi.fn()
  apiClient.request.mockImplementation(request => {
    const { url,method }=request
    if(method==='PUT') return Promise.resolve({ data:{ employeeId:9 } })
    if(url==='/api/hr/leave') return Promise.resolve({ data:[{employeeId:9,leaveId:2,reason:'Selected leave',status:'Pending',days:1},{employeeId:999,leaveId:99,reason:'Other employee leave'}] })
    if(url==='/api/hr/employees') return Promise.resolve({ data:employees })
    if(url.startsWith('/api/hr/employees/') && !url.endsWith('summary') && !url.endsWith('department-distribution') && !url.endsWith('type-distribution') && !url.endsWith('attendance-overview')) {
      const employee=employees.find(row=>String(row.employeeId)===url.split('/').at(-1))
      return employee ? Promise.resolve({data:employee}) : Promise.reject({response:{status:404}})
    }
    if(url.includes('/employee/')) return Promise.resolve({data:[{employeeId:Number(url.split('/').at(-1)),attendanceId:1,leaveId:2,performanceId:3,date:'2026-10-04',status:'Present',employeeName:'Own record',period:'Own period'},{employeeId:999,attendanceId:99,leaveId:99,performanceId:99,employeeName:'Other employee',period:'Other period'}]})
    return Promise.resolve({data:[]})
  })
  employeeService.getEmployeeBatches.mockResolvedValue({data:{batches:[{batchId:77,batchName:'Assigned Batch',status:'Active'}]}})
})
afterEach(cleanup)
const app=(path='/employee/hr-employees') => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/employee/hr-employees" element={<HrApiModule module="employees" />} /><Route path="/employee/hr-employees/:employeeId" element={<EmployeeDetails />} /></Routes></MemoryRouter>)
it.each(names.flatMap(name=>['name','details'].map(action=>[name,action])))('opens %s from %s using the resource ID',async(name,action)=>{
  app()
  const button=await screen.findByRole('button',{name,exact:true})
  fireEvent.click(action==='name'?button:within(button.closest('tr')).getByRole('button',{name:'Details',exact:true}))
  await screen.findByRole('heading',{name,level:1})
  const employee=employees.find(row=>row.fullName===name)
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({url:'/api/hr/employees/'+employee.employeeId}))
  expect(screen.getAllByText(employee.email).length).toBeGreaterThan(0)
  expect(screen.getAllByText(employee.role).length).toBeGreaterThan(0)
  expect(apiClient.request.mock.calls.some(([r])=>r.url.includes(employee.employeeCode)||r.url.includes('/'+employee.userId))).toBe(false)
})
it('switches NANI to Prabha without stale profile data',async()=>{
  app('/employee/hr-employees/9')
  await screen.findByRole('heading',{name:names[0],level:1})
  fireEvent.click(screen.getByRole('link',{name:'Back to Employees'}))
  const button=await screen.findByRole('button',{name:names[4],exact:true})
  fireEvent.click(within(button.closest('tr')).getByRole('button',{name:'Details'}))
  await screen.findByRole('heading',{name:names[4],level:1})
  expect(screen.queryByRole('heading',{name:names[0]})).not.toBeInTheDocument()
})
it('uses scoped tab APIs and removes explicit other employee records',async()=>{
  app('/employee/hr-employees/9')
  await screen.findByRole('heading',{name:names[0],level:1})
  for(const tab of ['Attendance','Leaves','Performance']) {
    fireEvent.click(screen.getByRole('tab',{name:tab,exact:true}))
    await screen.findByRole('table')
    expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({url:tab==='Leaves' ? '/api/hr/leave' : '/api/hr/'+tab.toLowerCase()+'/employee/9'}))
    expect(screen.queryByText('Other period')).not.toBeInTheDocument()
    expect(document.querySelectorAll('tbody tr')).toHaveLength(1)
    expect(screen.getByRole('heading',{name:names[0],level:1})).toBeInTheDocument()
  }
  fireEvent.click(screen.getByRole('tab',{name:'Batches',exact:true}))
  expect(await screen.findByRole('link',{name:'View Batch'})).toHaveAttribute('href','/employee/batches/77')
  expect(employeeService.getEmployeeBatches).toHaveBeenCalledWith('9')
})
it('shows loading skeletons before a response and missing data after it',async()=>{
  let resolve
  apiClient.request.mockReturnValueOnce(new Promise(done=>{resolve=done}))
  app('/employee/hr-employees/9')
  expect(screen.getByRole('status',{name:'Loading employee details'})).toBeInTheDocument()
  expect(screen.queryByText('Employee not found')).not.toBeInTheDocument()
  resolve({data:employees[0]})
  await screen.findByRole('heading',{name:names[0]})
  expect(screen.getByText('Attendance', { selector:'.kini-kpi__label' }).parentElement).toHaveTextContent(String.fromCharCode(8212))
  expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0)
})
it('falls back on detail 404 to an exact directory resource ID, never its code',async()=>{
  apiClient.request.mockRejectedValueOnce({response:{status:404}})
  expect((await loadHrEmployeeDetails('9')).employee.fullName).toBe(names[0])
  app('/employee/hr-employees/EMP-90')
  await screen.findByText('Employee not found')
})
it.each([401,403,500])('shows an error for HTTP %s and can retry',async status=>{
  apiClient.request.mockRejectedValueOnce({response:{status}})
  app('/employee/hr-employees/9')
  await screen.findByRole('alert')
  expect(apiClient.request.mock.calls.some(([r])=>r.url==='/api/hr/employees')).toBe(false)
  fireEvent.click(screen.getByRole('button',{name:'Retry'}))
  await screen.findByRole('heading',{name:names[0]})
})
it('rejects mismatched identities and does not derive resource IDs from user IDs or codes',async()=>{
  apiClient.request.mockResolvedValueOnce({data:employees[1]})
  await expect(loadHrEmployeeDetails('9')).rejects.toThrow('unexpected employee')
  expect(employeeIdOf({EmployeeId:9,userId:99})).toBe(9)
  expect(employeeIdOf({employeeId:'',id:9})).toBe(9)
  expect(employeeIdOf({userId:99,employeeCode:'EMP-009'})).toBeUndefined()
})
it('honors module permissions before requesting related information',async()=>{
  access.deny='attendance'
  app('/employee/hr-employees/9')
  await screen.findByRole('heading',{name:names[0]})
  fireEvent.click(screen.getByRole('tab',{name:'Attendance'}))
  expect(screen.getByRole('alert')).toHaveTextContent('permission')
  expect(apiClient.request.mock.calls.some(([r])=>r.url.includes('/attendance/employee'))).toBe(false)
})
it('uses the existing edit form and employee update API',async()=>{
  app('/employee/hr-employees/9')
  await screen.findByRole('heading',{name:names[0]})
  fireEvent.click(screen.getByRole('button',{name:'Edit Employee'}))
  fireEvent.click(screen.getByRole('button',{name:'Save Test Employee'}))
  await screen.findByRole('heading',{name:names[0]})
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({method:'PUT',url:'/api/hr/employees/9',data:{firstName:'Updated'}}))
})
it('keeps list Edit as its existing action',async()=>{
  app()
  const button=await screen.findByRole('button',{name:names[0],exact:true})
  fireEvent.click(within(button.closest('tr')).getByRole('button',{name:'Edit',exact:true}))
  await screen.findByRole('dialog')
  expect(screen.queryByRole('heading',{name:names[0],level:1})).not.toBeInTheDocument()
})

it('keeps list Delete scoped to the original employee resource', async () => {
  app()
  const button=await screen.findByRole('button',{name:names[0],exact:true})
  fireEvent.click(within(button.closest('tr')).getByRole('button',{name:'Delete',exact:true}))
  fireEvent.click(await screen.findByRole('button',{name:'Confirm',exact:true}))
  await vi.waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({method:'DELETE',url:'/api/hr/employees/9'})))
})
