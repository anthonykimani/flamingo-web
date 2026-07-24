'use client'

import SelectTheme from '@/components/pages/select_theme'
import { Suspense } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

const SelectThemeContainer = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <SelectTheme />
    </Suspense>
  )
}

export default SelectThemeContainer
