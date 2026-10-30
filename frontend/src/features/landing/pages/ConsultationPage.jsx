import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsultationModal from '../components/consultation/ConsultationModal'

/**
 * ConsultationPage — Standalone page that opens the premium consultation modal.
 * If the user closes the modal, they're redirected back to the home page.
 */
export default function ConsultationPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white">
      <ConsultationModal open={open} onClose={handleClose} />
    </div>
  )
}
