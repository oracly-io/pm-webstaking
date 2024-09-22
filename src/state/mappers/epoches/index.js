import { curryRight, isEmpty } from 'lodash'
import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'

import { ORCY_ADDRESS } from '@constants'
import { blockchain2EntityMap } from '@utils'

export const BC_EPOCH_MAP = {
  'id'        : '0.0',
  'epochid'   : '0.0',
  'startDate' : '0.1',
  'endDate'   : '0.2',
  'startedAt' : '0.3',
  'endedAt'   : '0.4',
  'stakes'    : '1.0',
  'stakefund' : '2.0',
}
export const blockchain2EpochMap = curryRight(blockchain2EntityMap)(BC_EPOCH_MAP)
export const blockchain2Epoch = (bcepochMap, rewardfunds) => {
  const epoch = {
    ...bcepochMap,
    stakingErc20: ORCY_ADDRESS,
  }

  epoch.endedAt = Number(epoch.endedAt) ? epoch.endedAt : null
  epoch.stakefund = epoch.stakefund && toDecimalERC20(epoch.stakefund, epoch.stakingErc20)

  if (!isEmpty(rewardfunds)) epoch.rewardfunds = rewardfunds

  return epoch
}

export const BC_EPOCH_REWARDFUND_MAP = {
  'collected' : '3.0',
}
export const blockchainEpoch2EpochRewardfundMap = curryRight(blockchain2EntityMap)(BC_EPOCH_REWARDFUND_MAP)