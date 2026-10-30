import React from 'react'
import { createRoot } from 'react-dom/client'
import EmployeeFormModal from '../src/features/organization/components/EmployeeFormModal.jsx'
import '../src/index.css'
import '../src/styles/globals.css'
import '../src/styles/theme.css'
import '../src/styles/brand-theme.css'
import '../src/styles/app-density.css'

createRoot(document.getElementById('root')).render(<EmployeeFormModal open onClose={() => {}} />)
