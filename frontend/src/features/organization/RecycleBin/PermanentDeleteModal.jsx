import Modal from '@shared/components/Modal'
import { Button } from '@shared/components/FormElements'

export default function PermanentDeleteModal({ open, loading, onClose, onConfirm }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Permanently?"
      description="This action cannot be undone."
      size="sm"
      footer={(
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Delete Forever
          </Button>
        </div>
      )}
    >
      <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
        This record will be removed permanently from the database.
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Are you sure?
      </p>
    </Modal>
  )
}
