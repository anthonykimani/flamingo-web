'use client'

import SelectTheme from '@/components/pages/select_theme'
import React, { Suspense } from 'react'

const SelectThemeContainer = () => {
  return (
    <Suspense>
        <SelectTheme />
    </Suspense>
  )
}

export default SelectThemeContainer
