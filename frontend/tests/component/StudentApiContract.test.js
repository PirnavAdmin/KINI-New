import { beforeEach, expect, it, vi } from 'vitest';
import { studentsApi } from '../../src/api/students';
import apiClient from '../../src/shared/services/apiClient';
vi.mock('../../src/shared/services/apiClient',()=>({default:{patch:vi.fn(),get:vi.fn(),put:vi.fn()}}));
beforeEach(()=>vi.clearAllMocks());
it('deactivates with the Swagger status route and no unrelated fields',async()=>{apiClient.patch.mockResolvedValue({data:{studentId:16,status:'Inactive'}});await studentsApi.deactivate(16,{name:'Student',courseId:8});expect(apiClient.patch).toHaveBeenCalledWith('/api/students/16/status',{status:'Inactive'});expect(apiClient.put).not.toHaveBeenCalled();});
it('propagates a deactivation API failure',async()=>{apiClient.patch.mockRejectedValue({response:{status:404}});await expect(studentsApi.deactivate(16)).rejects.toMatchObject({response:{status:404}});});
it('uses the documented student attendance endpoint',async()=>{apiClient.get.mockResolvedValue({data:[]});await studentsApi.getAttendance(16);expect(apiClient.get).toHaveBeenCalledWith('/api/Attendance/student/16',{params:undefined});});
