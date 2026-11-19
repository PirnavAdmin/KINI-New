import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { LiveTable } from '@features/hr/components/portal/HrLiveKit'

afterEach(cleanup)
function Table({ rows }) {
  const [selected, onSelect] = useState(new Set())
  return <LiveTable rows={rows} columns={[{ key: 'name', header: 'Name', render: row => row.name }]} rowKey={row => row.id} selected={selected} onSelect={onSelect} />
}
it('never selects every missing-ID row through an undefined selection key', () => {
  render(<Table rows={[{ name: 'Missing A' }, { name: 'Missing B' }, { id: 9, name: 'Valid employee' }]} />)
  const boxes = screen.getAllByRole('checkbox', { name: 'Select row' })
  expect(boxes[0]).toBeDisabled()
  expect(boxes[1]).toBeDisabled()
  fireEvent.click(boxes[2])
  expect(boxes[2]).toBeChecked()
  expect(boxes[0]).not.toBeChecked()
  expect(boxes[1]).not.toBeChecked()
})
it('does not group rows with duplicated backend keys into one selection', () => {
  render(<Table rows={[{ id: 9, name: 'Duplicate A' }, { id: 9, name: 'Duplicate B' }, { id: 10, name: 'Valid employee' }]} />)
  const boxes = screen.getAllByRole('checkbox', { name: 'Select row' })
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }))
  expect(boxes[0]).toBeDisabled()
  expect(boxes[1]).toBeDisabled()
  expect(boxes[0]).not.toBeChecked()
  expect(boxes[1]).not.toBeChecked()
  expect(boxes[2]).toBeChecked()
})
