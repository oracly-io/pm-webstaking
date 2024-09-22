import React, { useMemo } from 'react'
import { eq, gt, gte, sub } from '@oracly/pm-libs/calc-utils'
import { get } from '@oracly/pm-libs/immutable'

import { STATUSES } from '@constants'
import { getEpochReward } from '@utils'

import ClaimButton from './ClaimButton'
import Claimed from './Claimed'
import StatusCell from './StatusCell'
import RewardCell from './RewardCell'
import CollectedCell from './CollectedCell'

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
    claimable,
    claimed
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
    if (rowData.claimed) return <Claimed />
    return null
  },
  reward: ({ cellData, rowData }) => (
    <RewardCell
      depositid={rowData.depositid}
      epochid={rowData.epochid}
      erc20={rowData.erc20}
      amount={cellData}
    />
  ),
  collected: ({ cellData, rowData }) => (
    <CollectedCell
      epochid={rowData.epochid}
      erc20={rowData.erc20}
      amount={cellData}
    />
  ),
}

export const useColumns = ({ showClaim }) => {
  return useMemo(() => {
    const columns = [
      { label: 'Epoch', dataKey: 'epochid', cellRenderer: cellRenderers.epoch },
      { label: 'Status', dataKey: 'status', cellRenderer: cellRenderers.status },
      { label: 'Collected', dataKey: 'collected', cellRenderer: cellRenderers.collected },
      { label: 'Reward', dataKey: 'reward', cellRenderer: cellRenderers.reward },
    ]

    if (showClaim) columns.push({ label: '', dataKey:'', cellRenderer: cellRenderers.claim })

    return columns
  }, [showClaim])
}