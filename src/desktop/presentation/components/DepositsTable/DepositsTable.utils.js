import React from 'react'
import { eq, gt } from '@oracly/pm-libs/calc-utils'

import { STATUSES } from '@constants'
import { StatusCell, CurrencyCell, DateCell } from '@components/common/cells'

import DetailsButton from './DetailsButton'
import ClaimedCell from './ClaimedCell'

export const deposit2TableData = (deposit, { actualEpochid, erc20 }) => {
  const {
    depositid,
    stake,
    stakedAt,
    stakingErc20,
    epochStaked,
    epochUnstaked,
    withdrawn,
  } = deposit

  const claimed = deposit?.rewardfunds?.deposit?.[erc20]?.payout || '0'

  let status = STATUSES.PENDING
  if (epochStaked && gt(actualEpochid, epochStaked)) status = STATUSES.STAKED
  if (epochUnstaked && gt(epochUnstaked, epochStaked) && eq(actualEpochid, epochUnstaked)) status = STATUSES.PENDING_UNSTAKED
  if (epochUnstaked && (gt(actualEpochid, epochUnstaked) || eq(epochStaked, epochUnstaked))) {
    status = STATUSES.UNSTAKED
  }
  if (withdrawn) status = STATUSES.WITHDRAWN

  return {
    depositid,
    status,
    stake,
    stakedAt,
    stakingErc20,
    claimed,
    erc20,
  }
}

const cellRenderers = {
  status: ({ cellData }) => <StatusCell status={cellData} />,
  staked: ({ cellData }) => <DateCell date={cellData} />,
  stake: ({ cellData, rowData }) => (
    <CurrencyCell
      erc20={rowData.stakingErc20}
      amount={cellData}
    />
  ),
  claimed: ({ cellData, rowData }) => (
    <ClaimedCell
      depositid={rowData.depositid}
      erc20={rowData.erc20}
      amount={cellData}
    />
  ),
  details: () => <DetailsButton />,
}

export const columns = [
  { label: 'Deposit', dataKey: 'stake', cellRenderer: cellRenderers.stake },
  { label: 'Claimed', dataKey: 'claimed', cellRenderer: cellRenderers.claimed },
  { label: 'Status', dataKey: 'status', cellRenderer: cellRenderers.status },
  { label: 'Staked', dataKey: 'stakedAt', cellRenderer: cellRenderers.staked },
  { label: '', dataKey:'', cellRenderer: cellRenderers.details },
]