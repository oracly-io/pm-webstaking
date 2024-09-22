import React from 'react'
import { useParams } from 'react-router-dom'

import StakingWidget from '@components/StakingWidget'
import DepositInfo from '@components/DepositInfo'
import EpochesTable from '@components/EpochesTable'

const DepositPage = () => {
  const { stakerid, depositid } = useParams()

  return (
    <div>
      <StakingWidget stakerid={stakerid.toLowerCase()} />
      <DepositInfo stakerid={stakerid.toLowerCase()} depositid={depositid.toLowerCase()} />
      <EpochesTable stakerid={stakerid.toLowerCase()} depositid={depositid.toLowerCase()} />
    </div>
  )
}

export default React.memo(DepositPage)