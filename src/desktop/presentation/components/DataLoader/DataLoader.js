import { sub } from '@oracly/pm-libs/calc-utils'

import { useEffectState } from '@/hooks'
import {
  READ_BLOCKCHAIN_BLOCK_NUMBER,
  GET_BLOCKCHAIN_MENTOR_STATISTICS,
  GET_BLOCKCHAIN_EPOCH,
  GET_BLOCKCHAIN_ACTUAL_EPOCH_ID,
  GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS,
  GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS,
  GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS,
  GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS,
  APPLICATION_NETWORK_STATUS,
  GET_ALLOWANCE,
} from '@actions'
import { LT, ORCY_ADDRESS, DEMO_ADDRESS, USDC_ADDRESS } from '@constants'
import { useScheduledQuery, useScheduledCommand } from '@hooks'
import { connect } from '@state'
import { getLatestbcBlockNumber, getActualEpochId } from '@state/getters'
import { getLatestbcBlock, isOnline, getNetworkStatus } from '@state/getters'
import { getActiveAccountAllowanceERC20, getActiveAccountAddress } from '@state/getters'
import { getPageDataStakingErc20 } from '@state/getters'
import { getStatisticsBarIsOpened, isNeverPerformed } from '@state/getters'
import { getStakingStakerDepositsSize } from '@state/getters'
import { getStatisticsBarAccount } from '@state/getters'
import { getBettingBettorPredictionsSize } from '@state/getters'
import { determineNetworkStatus } from '@utils'

const DataLoader = (props) => {

  const {
    erc20,
    account,
    allowance,
    statisticsBarAccount,
    isStatisticsBarOpened,
    is_bc_blockNumberExist,
    is_stakerDepositsSizeExist,
    is_actualEpochExist,
    is_bettorPredictionsSizeExist,
  } = props

  useScheduledQuery((query) => {
    query(READ_BLOCKCHAIN_BLOCK_NUMBER, {}, { schedule: 5 })
  }, [])

  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && statisticsBarAccount && is_bc_blockNumberExist) {
      const blockNumber = getLatestbcBlockNumber(state)

      // mentor
      const isMentorStatisticsNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_MENTOR_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_MENTOR_STATISTICS, {
        mentorid: statisticsBarAccount,
        erc20: USDC_ADDRESS,
        txn: { blockNumber },
        loadType: isMentorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_MENTOR_STATISTICS, {
        mentorid: statisticsBarAccount,
        erc20: DEMO_ADDRESS,
        txn: { blockNumber },
        loadType: isMentorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })

      // staker
      const isStakerPaidoutNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      const isStakerLastActivityNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      const isStakerStakeNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS, {
        stakerid: statisticsBarAccount,
        txn: { blockNumber },
        loadType: isStakerStakeNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS, {
        stakerid: statisticsBarAccount,
        txn: { blockNumber },
        loadType: isStakerLastActivityNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, {
        stakerid: statisticsBarAccount,
        erc20: USDC_ADDRESS,
        txn: { blockNumber },
        loadType: isStakerPaidoutNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, {
        stakerid: statisticsBarAccount,
        erc20: ORCY_ADDRESS,
        txn: { blockNumber },
        loadType: isStakerPaidoutNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, {
        stakerid: statisticsBarAccount,
        erc20: DEMO_ADDRESS,
        txn: { blockNumber },
        loadType: isStakerPaidoutNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })

      // bettor
      const isBettorStatisticsNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_BETTOR_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      const isBettorLastActivityNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_BETTOR_STATISTICS, {
        bettorid: statisticsBarAccount,
        erc20: USDC_ADDRESS,
        txn: { blockNumber },
        loadType: isBettorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_BETTOR_STATISTICS, {
        bettorid: statisticsBarAccount,
        erc20: ORCY_ADDRESS,
        txn: { blockNumber },
        loadType: isBettorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_BETTOR_STATISTICS, {
        bettorid: statisticsBarAccount,
        erc20: DEMO_ADDRESS,
        txn: { blockNumber },
        loadType: isBettorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS, {
        bettorid: statisticsBarAccount,
        txn: { blockNumber },
        loadType: isBettorLastActivityNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, statisticsBarAccount])

  // get actual epoch stakefunds
  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && statisticsBarAccount && is_bc_blockNumberExist) {
      const blockNumber = getLatestbcBlockNumber(state)

      if (is_actualEpochExist) {
        const actualEpochId = getActualEpochId(state)
        const erc20 = ORCY_ADDRESS
        const isActualEpochNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_EPOCH, [actualEpochId, erc20, LT.INITIAL])
        const loadType = isActualEpochNeverPerformed ? LT.INITIAL : LT.UPDATE
        query(GET_BLOCKCHAIN_EPOCH, { epochid: actualEpochId, erc20, loadType, txn: { blockNumber } }, { schedule: 300 })
      } else {
        const isActualEpochIdNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, [LT.INITIAL])
        const loadType = isActualEpochIdNeverPerformed ? LT.INITIAL : LT.UPDATE
        query(GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, { txn: { blockNumber }, loadType }, { schedule: 300 })
      }

    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, is_actualEpochExist, statisticsBarAccount])

  // get staker joined
  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && statisticsBarAccount && is_bc_blockNumberExist && is_stakerDepositsSizeExist) {
      const blockNumber = getLatestbcBlockNumber(state)
      const offset = getStakingStakerDepositsSize(state, statisticsBarAccount)
      const isStakerJoinedNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS, {
        stakerid: statisticsBarAccount,
        offset: sub(offset, 1),
        txn: { blockNumber },
        loadType: isStakerJoinedNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, is_stakerDepositsSizeExist, statisticsBarAccount])

  // get bettor joined
  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && statisticsBarAccount && is_bc_blockNumberExist && is_bettorPredictionsSizeExist) {
      const blockNumber = getLatestbcBlockNumber(state)
      const offset = getBettingBettorPredictionsSize(state, statisticsBarAccount)
      const isBettorJoinedNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS, {
        bettorid: statisticsBarAccount,
        offset: sub(offset, 1),
        txn: { blockNumber },
        loadType: isBettorJoinedNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, is_bettorPredictionsSizeExist, statisticsBarAccount])

  useScheduledCommand((command, state) => {
    const bcblock = getLatestbcBlock(state)
    const status = determineNetworkStatus(bcblock, isOnline(state))
    const networkStatus = getNetworkStatus(state)

    if (!status) return
    if (status === networkStatus) return

    command(APPLICATION_NETWORK_STATUS, { status }, { schedule: 1 })
  }, [])

  useEffectState((state) => {
    if (!is_bc_blockNumberExist) return

    if (account && (allowance === undefined)) {
      const blockNumber = getLatestbcBlockNumber(state)
      props.GET_ALLOWANCE({ account, erc20, txn: { blockNumber } })
    }
  }, [is_bc_blockNumberExist, account, allowance, erc20])

  return null
}

export default connect(
  state => {
    const erc20 = getPageDataStakingErc20(state)
    const account = getActiveAccountAddress(state)
    const allowance = getActiveAccountAllowanceERC20(state, erc20)
    const statisticsBarAccount = getStatisticsBarAccount(state)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)
    const is_actualEpochExist = !!getActualEpochId(state)
    const is_stakerDepositsSizeExist = !!getStakingStakerDepositsSize(state, statisticsBarAccount)
    const isStatisticsBarOpened = getStatisticsBarIsOpened(state)
    const is_bettorPredictionsSizeExist = !!getBettingBettorPredictionsSize(state, statisticsBarAccount)

    return {
      erc20,
      account,
      allowance,
      statisticsBarAccount,
      isStatisticsBarOpened,
      is_bc_blockNumberExist,
      is_stakerDepositsSizeExist,
      is_actualEpochExist,
      is_bettorPredictionsSizeExist,
    }
  },
  ({ query }) => [query(GET_ALLOWANCE)]
)(DataLoader)