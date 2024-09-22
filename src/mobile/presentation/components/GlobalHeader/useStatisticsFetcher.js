import { sub } from '@oracly/pm-libs/calc-utils'

import { GET_BLOCKCHAIN_MENTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_ACTUAL_EPOCH_ID } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_EPOCH } from '@actions'
import { DEMO_ADDRESS, USDC_ADDRESS } from '@constants'
import { ORCY_ADDRESS } from '@constants'
import { useScheduledQuery } from '@hooks'
import { getLatestbcBlockNumber, getActualEpochId, getStakingStakerDepositsSize } from '@state/getters'

const useStatisticsFetcher = ({
  is_bc_blockNumberExist,
  isStatisticsBarOpened,
  is_actualEpochExist,
  is_stakerDepositsSizeExist,
  ready,
  account,
}) => {

  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && ready && account && is_bc_blockNumberExist) {
      const blockNumber = getLatestbcBlockNumber(state)

      query(GET_BLOCKCHAIN_MENTOR_STATISTICS, { mentorid: account, erc20: USDC_ADDRESS, txn: { blockNumber } }, { schedule: 300 })
      query(GET_BLOCKCHAIN_MENTOR_STATISTICS, { mentorid: account, erc20: DEMO_ADDRESS, txn: { blockNumber } }, { schedule: 300 })

      query(GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS, { stakerid: account, txn: { blockNumber } }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS, { stakerid: account, txn: { blockNumber } }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, { stakerid: account, erc20: USDC_ADDRESS, txn: { blockNumber } }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, { stakerid: account, erc20: ORCY_ADDRESS, txn: { blockNumber } }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, { stakerid: account, erc20: DEMO_ADDRESS, txn: { blockNumber } }, { schedule: 300 })
    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, ready, account])

  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && ready && account && is_bc_blockNumberExist) {
      const blockNumber = getLatestbcBlockNumber(state)

      if (is_actualEpochExist) {
        const actualEpochId = getActualEpochId(state)
        query(GET_BLOCKCHAIN_EPOCH, { epochid: actualEpochId, erc20: ORCY_ADDRESS, txn: { blockNumber } }, { schedule: 300 })
      } else {
        query(GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, { txn: { blockNumber } }, { schedule: 300 })
      }

    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, is_actualEpochExist, ready, account])

  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && ready && account && is_bc_blockNumberExist) {
      const blockNumber = getLatestbcBlockNumber(state)
      const offset = getStakingStakerDepositsSize(state)

      if (is_stakerDepositsSizeExist) {
        query(GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS, { stakerid: account, offset: sub(offset, 1), txn: { blockNumber } }, { schedule: 300 })
      }

    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, is_stakerDepositsSizeExist, ready, account])
}

export default useStatisticsFetcher