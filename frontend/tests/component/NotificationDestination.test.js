import { expect, it } from 'vitest';
import { notificationDestination as target } from '../../src/shared/utils/notificationDestination';
it.each([
 [{title:'Employee Permissions Changed',description:'Permissions for employee ID 16 have been updated.'}, '/organization/employees?access=16'],
 [{notificationType:'EmployeePermissionsChanged',employeeId:22}, '/organization/employees?access=22'],
 [{title:'New HR User Created'}, '/employee/hr-settings?tab=users'],
 [{title:'Course updated',courseId:8}, '/organization/courses/8/details'],
 [{title:'Batch updated',batchId:9}, '/organization/batches/9/details'],
 [{title:'Student enrolled',studentId:3}, '/organization/students/3'],
 [{title:'Student approval pending'}, '/organization/students?tab=approvals'],
 [{title:'Live Class Scheduled'}, '/organization/live-classes'],
 [{title:'Other system notice'}, '/organization/notifications'],
 [{actionUrl:'/organization/batches?tab=active'}, '/organization/batches?tab=active'],
 [{actionUrl:'https://example.com'}, '/organization/notifications'],
 [{actionUrl:'//example.com'}, '/organization/notifications'],
 [{actionUrl:'/super-admin/dashboard'}, '/organization/notifications'],
])('resolves %j', (item, expected) => expect(target(item,'org-admin')).toBe(expected));
it('keeps other portals in their own notification area', () => {
 expect(target({title:'Employee Permissions Changed'}, 'student')).toBe('/student/notifications');
});
