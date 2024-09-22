import { get, mapValues, toLower } from 'lodash'
import { div, mul, roundERC20 } from '@oracly/pm-libs/calc-utils'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import config from '@config'
import { NETWORK_STATUS } from '@constants'

export function getEpochReward(epoch, { erc20, stake }) {
  if (!Number(epoch.stakefund)) return '0'

  const collected = get(epoch, ['rewardfunds', erc20, 'collected'])

  return roundERC20(div(mul(collected, stake), epoch.stakefund), erc20)
}

export function createEpochesTableFilter(erc20, sinceEpoch, untilEpoch) {
  return { erc20, sinceEpoch, untilEpoch }
}

export function createDepositsTableFilter(stakerid) {
  return { stakerid }
}

export function blockchain2EntityMap(bcentity, ENTITY_BC_MAP) {
  return mapValues(ENTITY_BC_MAP, (key) => {
    const value = get(bcentity, key)
    return typeof value === 'string' ? toLower(value) : value
  })
}

export function generateDepositEpochids(epochStaked, epochUnstaked, actualEpochid) {

  const untilEpoch = epochUnstaked || actualEpochid

  const epochids = []

  if (epochStaked && untilEpoch) {
    for (let epochid = Number(untilEpoch); epochid >= Number(epochStaked); epochid--) {
      epochids.push(String(epochid))
    }
  }

  return epochids
}

const checkObsolete = (timestamp) => {
  if (!timestamp) return false
  const age = nowUnixTS() - timestamp
  return !!(age >= config.obsolit_data_limit_age)
}
export function determineNetworkStatus(bcblock, isOnline) {
  if (!isOnline) return NETWORK_STATUS.ERROR
  if (checkObsolete(bcblock?.timestamp)) return NETWORK_STATUS.WARNING
  return NETWORK_STATUS.SUCCESS
}