import React from 'react'
import { eq, gt } from '@oracly/pm-libs/calc-utils'

import { STATUSES } from '@constants'
import Status from '@components/common/Status'

import ClaimedCell from './ClaimedCell'
import DepositStakeCell from './DepositStakeCell'
import { withCellMeasurer } from '@components/common/Table'

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
  if (epochUnstaked && eq(actualEpochid, epochUnstaked)) status = STATUSES.PENDING_UNSTAKED
  if (epochUnstaked && (gt(actualEpochid, epochUnstaked) || eq(epochStaked, actualEpochid))) {
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
  status: ({ cellData }) => <Status status={cellData} />,
  stake: ({ cellData, rowData }) => (
    <DepositStakeCell
      amount={cellData}
      erc20={rowData.stakingErc20}
      depositid={rowData.depositid}
    />
  ),
  claimed: ({ cellData, rowData, columnData }) => (
    <ClaimedCell
      depositid={rowData.depositid}
      erc20={rowData.erc20}
      amount={cellData}
      {...columnData}
    />
  ),
}

export const columns = [
  { label: 'Deposit', dataKey: 'stake', cellRenderer: withCellMeasurer(cellRenderers.stake), flexGrow: 1 },
  { label: 'Status', dataKey: 'status', cellRenderer: withCellMeasurer(cellRenderers.status), flexGrow: 1 },
  { label: 'Claimed', dataKey: 'claimed', cellRenderer: withCellMeasurer(cellRenderers.claimed), flexGrow: 1 },
]