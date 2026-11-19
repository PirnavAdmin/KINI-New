import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { studentsApi } from '@/api/students';
import { attendanceRowsOf, normalizeAttendanceRow } from '@/pages/students/studentAttendance';
import EmployeeAttendance from './AttendanceApiReady';

function StudentAttendance({ lastSevenDays }) {
  const [result, setResult] = useState({ loading: true, rows: [], error: '' });
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: students } = await studentsApi.list();
        const rows = [];
        let failures = 0;
        let next = 0;
        await Promise.all(Array.from({ length: Math.min(4, students.length) }, async () => {
          while (next < students.length) {
            const student = students[next++];
            try {
              const response = await studentsApi.getAttendance(student.id);
              rows.push(...attendanceRowsOf(response.data).map((row, index) => ({
                ...normalizeAttendanceRow(row, index), studentId: student.id, name: student.name,
              })));
            } catch { failures += 1; }
          }
        }));
        if (active) setResult({ loading: false, rows, error: failures ? `Attendance could not be loaded for ${failures} students. Please try again.` : '' });
      } catch (error) {
        if (active) setResult({ loading: false, rows: [], error: studentsApi.getErrorMessage(error) });
      }
    }
    load();
    return () => { active = false; };
  }, []);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const rows = result.rows.filter(row => !lastSevenDays || (new Date(row.date) >= start && new Date(row.date) <= end))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return <section className="space-y-4 p-5">
    <h1 className="text-2xl font-bold">Student Attendance{lastSevenDays ? ' — Last 7 days' : ''}</h1>
    {result.error && <p role="alert" className="text-red-600">{result.error}</p>}
    {result.loading ? <p role="status">Loading student attendance…</p> : rows.length ? <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm">
      <thead><tr>{['Student', 'Date', 'Class', 'Status'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={`${row.studentId}:${row.id}:${index}`} className="border-t">
        <td className="p-3"><Link className="text-blue-600" to={`/organization/students/${row.studentId}`}>{row.name}</Link></td>
        <td className="p-3">{row.date ? new Date(row.date).toLocaleDateString('en-IN') : 'Date unavailable'}</td>
        <td className="p-3">{row.class}</td><td className="p-3">{row.status}</td>
      </tr>)}</tbody>
    </table></div> : <p>No student attendance records{lastSevenDays ? ' in the last 7 days' : ''}.</p>}
  </section>;
}

export default function OrganizationAttendance() {
  const [params, setParams] = useSearchParams();
  const scope = params.get('scope') === 'students' ? 'students' : 'employees';
  return <>
    <nav aria-label="Attendance scope" className="flex gap-2 px-5 py-3">
      {['students', 'employees'].map(value => <button key={value} type="button" aria-pressed={scope === value}
        className={`rounded-lg px-4 py-2 text-sm font-semibold ${scope === value ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
        onClick={() => { const next = new URLSearchParams(params); next.set('scope', value); setParams(next); }}>
        {value === 'students' ? 'Student Attendance' : 'Employee Attendance'}
      </button>)}
    </nav>
    {scope === 'students' ? <StudentAttendance lastSevenDays={params.get('period') === '7-days'} /> : <EmployeeAttendance />}
  </>;
}
