import React from 'react'
import { useParams } from 'react-router-dom'

import StakingWidget from '@components/StakingWidget'
import DepositsTable from '@components/DepositsTable'

const DepositsPage = () => {
  const { stakerid } = useParams()

  return (
    <>
      <StakingWidget stakerid={stakerid.toLowerCase()} />
      <DepositsTable stakerid={stakerid.toLowerCase()} />
    </>
  )

}

export default React.memo(DepositsPage)
