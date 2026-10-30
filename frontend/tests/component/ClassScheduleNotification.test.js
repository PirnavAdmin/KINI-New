import { expect, it } from 'vitest'
import { classScheduleNotification, formatClassDate, formatClassSchedule, formatClassTime } from '../../src/shared/utils/classScheduleNotification'

it('formats the class API date and real clock fields without shifting the calendar day', () => {
  const schedule = classScheduleNotification({
    classTitle: 'Hooks',
    scheduledDate: '2026-09-06T00:00:00',
    startTime: '10:00:00',
    endTime: '11:20:00',
  })
  expect(schedule).toEqual({ classTitle: 'Hooks', scheduleLabel: '06 Sep 2026 • 10:00 AM – 11:20 AM' })
  expect(formatClassTime('14:30:00')).toBe('02:30 PM')
})

it('uses only a formatted date when a generated notification has no real class time', () => {
  expect(classScheduleNotification({
    title: 'Live class scheduled',
    message: 'React is scheduled for 2026-09-07T00:00:00.',
  })).toEqual({ classTitle: 'React', scheduleLabel: '07 Sep 2026' })
  expect(formatClassSchedule({ date: '2026-09-07T00:00:00' })).toBe('07 Sep 2026')
})

it('does not expose invalid or missing schedule values', () => {
  expect(formatClassDate('2026-09-31T00:00:00')).toBe('')
  expect(formatClassTime('25:90:00')).toBe('')
  expect(classScheduleNotification({ title: 'Other', message: 'No class scheduled' })).toBeNull()
})
