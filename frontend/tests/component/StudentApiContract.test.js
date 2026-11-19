import { beforeEach, expect, it, vi } from 'vitest';
import { studentsApi } from '../../src/api/students';
import apiClient from '../../src/shared/services/apiClient';
vi.mock('../../src/shared/services/apiClient',()=>({default:{patch:vi.fn(),get:vi.fn(),put:vi.fn()}}));
beforeEach(()=>vi.clearAllMocks());
it('formats structured country and address fields for the student overview',async()=>{
  apiClient.get.mockResolvedValue({data:{studentId:16,country:{name:'India'},address:{line1:'12 Main Road',city:'Hyderabad',state:'Telangana',pincode:'500001'}}});
  expect((await studentsApi.getById(16)).data).toMatchObject({country:'India',address:'12 Main Road, Hyderabad, Telangana, 500001'});
});
it('retains the edited student identity after a successful no-content update',async()=>{
  apiClient.put.mockResolvedValue({status:204,data:''});
  expect((await studentsApi.update(16,{firstName:'Updated',lastName:'Student',email:'student@example.test',phone:'9951886175',courseId:2,batchId:20})).data).toMatchObject({id:16,firstName:'Updated',batchId:20});
});
it('preserves inactive boolean flags when the API omits the status label',async()=>{apiClient.get.mockResolvedValue({data:[{studentId:16,isActive:false},{studentId:17,active:0},{studentId:18,isActive:true}]});expect((await studentsApi.list()).data.map(row=>row.status)).toEqual(['Inactive','Inactive','Active']);});
it('deactivates with the Swagger status route and no unrelated fields',async()=>{apiClient.patch.mockResolvedValue({data:{studentId:16,status:'Inactive'}});await studentsApi.deactivate(16,{name:'Student',courseId:8});expect(apiClient.patch).toHaveBeenCalledWith('/api/students/16/status',{status:'Inactive'});expect(apiClient.put).not.toHaveBeenCalled();});
it('propagates a deactivation API failure',async()=>{apiClient.patch.mockRejectedValue({response:{status:404}});await expect(studentsApi.deactivate(16)).rejects.toMatchObject({response:{status:404}});});
it('uses the documented student attendance endpoint',async()=>{apiClient.get.mockResolvedValue({data:[]});await studentsApi.getAttendance(16);expect(apiClient.get).toHaveBeenCalledWith('/api/Attendance/student/16',{params:undefined});});
