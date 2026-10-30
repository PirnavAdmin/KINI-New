import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, configure, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import apiClient from '@shared/services/apiClient'
import EmployeeDetails from '@features/hr/pages/EmployeeDetails'
import { loadEmployeeLeaveRecords, employeeLeaveSummary, resolveLeaveEmployee } from '@features/hr/services/hrEmployeeLeaveData'
vi.mock('@shared/services/apiClient',()=>({default:{request:vi.fn()}}))
vi.mock('@shared/hooks/usePermission',()=>({default:()=>({hasPermission:()=>true,can:()=>false,isLoading:false})}))
configure({asyncUtilTimeout:5000})
// Structural fixtures, not captured account records. Keep public/internal/user
// identifiers different to detect accidental route-code and user-ID matching.
const employee={employeeId:'EMP-009',id:9,userId:901,fullName:'Selected Mentor',email:'selected@example.test',role:'Mentor'}
const other={employeeId:'EMP-010',id:10,userId:902,fullName:'Other Mentor',email:'other@example.test'}
const own=(leaveId,status,days)=>({leaveId,employeeId:9,employeeName:'Selected Mentor',leaveType:'Sick',fromDate:'2026-10-01',toDate:'2026-10-02',reason:'Selected reason '+leaveId,status,days})
let records
beforeEach(()=>{
 records=[own(41,'PENDING',1),own(42,'APPROVED',2),own(43,'REJECTED',3),{...own(90,'PENDING',10),employeeId:10,reason:'Other private reason'}, {leaveId:9,id:9,userId:901,employeeName:'Selected Mentor',reason:'No employee link'}]
 apiClient.request.mockReset()
 apiClient.request.mockImplementation(({url})=>{
  if(url==='/api/hr/employees') return Promise.resolve({data:{items:[employee,other],totalPages:1,totalCount:2}})
  if(url==='/api/hr/leave') return Promise.resolve({data:{items:records,totalPages:1,totalCount:records.length}})
  return Promise.reject({response:{status:404}})
 })
})
afterEach(cleanup)
const app=()=>render(<MemoryRouter initialEntries={['/employee/hr-employees/EMP-009']}><Routes><Route path='/employee/hr-employees/:employeeId' element={<EmployeeDetails/>}/><Route path='/employee/hr-employees' element={<OtherLink/>}/></Routes></MemoryRouter>)
function OtherLink(){return <MemorylessDetails/>}
// Test navigation through the existing list route placeholder without requiring
// unrelated list APIs. The production list's navigation is covered separately.
import { Link } from 'react-router-dom'
function MemorylessDetails(){return <Link to='/employee/hr-employees/EMP-010'>Other employee</Link>}
it('shows EMP-009 internal-ID leaves and filtered KPIs without the broken request',async()=>{
 app();await screen.findByRole('heading',{name:'Selected Mentor'})
 fireEvent.click(screen.getByRole('tab',{name:'Leaves'}))
 await screen.findByText('Selected reason 41')
 expect(screen.getAllByText(/Selected reason/)).toHaveLength(3)
 expect(screen.queryByText('Other private reason')).not.toBeInTheDocument()
 expect(screen.queryByText('No employee link')).not.toBeInTheDocument()
 expect(screen.getByText('Total Requests').nextElementSibling).toHaveTextContent('3')
 expect(screen.getByText('Total Leave Days').nextElementSibling).toHaveTextContent('6')
 for(const label of ['Approved','Pending','Rejected']) expect(screen.getByText(label).nextElementSibling).toHaveTextContent('1')
 expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({method:'GET',url:'/api/hr/leave',params:{Page:1,Limit:100}}))
 expect(apiClient.request.mock.calls.some(([r])=>r.url.includes('/leave/employee/'))).toBe(false)
 const matching=resolveLeaveEmployee('EMP-009',[employee,other],records)
 expect(employeeLeaveSummary(matching.rows)).toEqual({total:3,approved:1,pending:1,rejected:1,days:6})
})
it('does not carry employee A leaves into employee B',async()=>{
 app();await screen.findByRole('heading',{name:'Selected Mentor'})
 fireEvent.click(screen.getByRole('tab',{name:'Leaves'}));await screen.findByText('Selected reason 41')
 fireEvent.click(screen.getByRole('link',{name:'Back to Employees'}))
 fireEvent.click(screen.getByRole('link',{name:'Other employee'}))
 await screen.findByRole('heading',{name:'Other Mentor'})
 fireEvent.click(screen.getByRole('tab',{name:'Leaves'}));await screen.findByText('Other private reason')
 expect(screen.queryByText('Selected reason 41')).not.toBeInTheDocument()
})
it('distinguishes successful empty data from request errors',async()=>{
 records=[];app();await screen.findByRole('heading',{name:'Selected Mentor'})
 fireEvent.click(screen.getByRole('tab',{name:'Leaves'}))
 await screen.findByText('No leave records found')
 expect(screen.getByText('This employee has not submitted any leave requests.')).toBeInTheDocument()
 expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
it.each([403,500])('keeps HTTP %s as an error with retry',async status=>{
 const original=apiClient.request.getMockImplementation()
 apiClient.request.mockImplementation(request=>request.url==='/api/hr/leave'?Promise.reject({response:{status}}):original(request))
 app();await screen.findByRole('heading',{name:'Selected Mentor'})
 fireEvent.click(screen.getByRole('tab',{name:'Leaves'}));await screen.findByRole('alert')
 if(status===403) expect(screen.getByRole('alert')).toHaveTextContent("You do not have permission to view this employee's leave records.")
 expect(screen.queryByText('No leave records found')).not.toBeInTheDocument()
 apiClient.request.mockImplementation(original)
 fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByText('Selected reason 41')
})
it('reads every page before filtering and shares Leave Details identity mapping',async()=>{
 apiClient.request.mockImplementation(({params})=>Promise.resolve({data:{items:params.Page===1?records.slice(0,2):records.slice(2),totalPages:2,totalCount:records.length}}))
 const value=await loadEmployeeLeaveRecords('EMP-009',{employee})
 expect(value.rows).toHaveLength(3)
 expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({params:{Page:2,Limit:100}}))
 expect(value.rows).toEqual(resolveLeaveEmployee('EMP-009',[employee],records).rows)
})
