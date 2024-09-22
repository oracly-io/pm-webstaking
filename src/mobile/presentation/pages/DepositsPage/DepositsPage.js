import React from 'react'
import { useParams } from 'react-router-dom'

import DepositsPageHeader from '@components/DepositsPageHeader'
import DepositsTable from '@components/DepositsTable'

const DepositsPage = () => {
  const { stakerid } = useParams()

  return (
    <>
      <DepositsPageHeader stakerid={stakerid.toLowerCase()} />
      <DepositsTable stakerid={stakerid.toLowerCase()} />
    </>
  )
}

export default DepositsPage