import ShopPage from '@/components/ui/ShopPage'
import ShopPageSkeleton from '@/components/common/ShopPageSkeleton'
import React, { Suspense } from 'react'

const Shop = () => {
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopPage />
    </Suspense>
  )
}

export default Shop