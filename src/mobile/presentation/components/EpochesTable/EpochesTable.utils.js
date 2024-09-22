import React, { useMemo } from 'react'
import { eq, gt, gte, sub } from '@oracly/pm-libs/calc-utils'
import { get } from '@oracly/pm-libs/immutable'

import { STATUSES } from '@constants'
import { withCellMeasurer } from '@components/common/Table'
import { getEpochReward } from '@utils'

import ClaimButton from './ClaimButton'
import Claimed from './Claimed'
import StatusCell from './StatusCell'
import RewardCell from './RewardCell'

import css from './EpochesTable.module.scss'

export const epoch2TableData = (epoch, {
  erc20,
  actualEpochid,
  stake,
  depositid,
  epochStaked,
  epochUnstaked,
  withdrawn,
  payout,
}) => {
  const { epochid } = epoch

  let status
  if (epochStaked) status = STATUSES.PENDING
  if (epochStaked && gt(epochid, epochStaked)) status = STATUSES.STAKED
  if (epochUnstaked && gt(epochUnstaked, epochStaked) && eq(epochid, epochUnstaked)) status = STATUSES.PENDING_UNSTAKED
  if (epochUnstaked && gte(epochid, epochUnstaked) && (gt(actualEpochid, epochUnstaked) || eq(epochStaked, epochUnstaked))) status = STATUSES.UNSTAKED
  if (withdrawn && gte(epochid, epochUnstaked)) status = STATUSES.WITHDRAWN

  const reward = getEpochReward(epoch, { erc20, stake })
  const hasReward = !!Number(reward)
  const remainder = sub(reward, payout)
  const collected = get(epoch, ['rewardfunds', erc20, 'collected']) || 0
  const claimable = hasReward && (gt(remainder, 0) || eq(epochid, actualEpochid)) && status !== STATUSES.PENDING
  const claimed = hasReward && !gt(remainder, 0) && !!payout && gt(actualEpochid, epochid)

  return {
    epochid,
    status,
    collected,
    reward,
    erc20,
    depositid,
    claimed,
    stake,
    claimable
  }
}

const cellRenderers = {
  status: ({ cellData, rowData }) => (
    <StatusCell
      status={cellData}
      epochid={rowData.epochid}
      erc20={rowData.erc20}
    />
  ),
  claim: ({ rowData }) => {
    if (rowData.claimable) {
      return (
        <ClaimButton epochid={rowData.epochid}
          depositid={rowData.depositid}
          erc20={rowData.erc20}
        />
      )
    }
    if (rowData.claimed) return <Claimed size={0.8} />
    return null
  },
  reward: ({ cellData, rowData }) => (
    <RewardCell
      className={css.rewardCell}
      epochid={rowData.epochid}
      erc20={rowData.erc20}
      amount={cellData}
    />
  ),
}

export const useColumns = ({ showClaim }) => {
  return useMemo(() => {
    const columns = [
      { label: 'Reward', dataKey: 'reward', cellRenderer: withCellMeasurer(cellRenderers.reward), flexGrow: 1 },
      { label: 'Status', dataKey: 'status', cellRenderer: withCellMeasurer(cellRenderers.status), flexGrow: 1 },
    ]

    if (showClaim) columns.push({
      label: '',
      dataKey: 'claimable',
      cellRenderer: withCellMeasurer(cellRenderers.claim),
      alignRight: true,
    })

    return columns
  }, [showClaim])
}