import { reduce } from 'lodash'
import { add, div, mul } from '@oracly/pm-libs/calc-utils'
import { get, set } from '@oracly/pm-libs/immutable'

import { GET_BLOCKCHAIN_BETTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_MENTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_EPOCH, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID } from '@actions'
import { EXCHANGES, ORCY_ADDRESS } from '@constants'

import { getActualEpoch, getActualEpochId } from '../epoches'
import { isInitialLoading } from '../asyncStatus'

const convertToUSD = (amount, erc20) => {
  const exchangeRate = EXCHANGES[erc20]
  return mul(amount, exchangeRate)
}

function getStatistics(state) {
  const statistics = get(state, ['statistics', 'collection'])
  return statistics
}

function getStatIdByERC20(state, erc20) {
  const id = get(state, ['statistics', 'erc20', erc20])

  return id
}

export function getStakingStatERC20(state, erc20) {
  const statistics = getStatistics(state)
  const id = getStatIdByERC20(state, erc20)
  const stats = get(statistics, [id])

  return stats
}

export function getStakingStatsBlockNumber(state, id) {
  const blockNumber = get(state, ['statistics', 'blockNumbers', id])

  return blockNumber
}

export function getStakingStakerDepositsSize(state, stakerid) {
  return get(state, ['statistics', stakerid, 'staker', '_meta', 'depositsSize'])
}

export function getBettingBettorPredictionsSize(state, bettorid) {
  return get(state, ['statistics', bettorid, 'bettor', '_meta', 'predictionsSize'])
}

export function getBettorStatistics(state, address) {
  let statistics = get(state, ['statistics', address, 'bettor'])

  statistics = set(statistics, ['isLoading'],
    isInitialLoading(state, GET_BLOCKCHAIN_BETTOR_STATISTICS, [address]) ||
    isInitialLoading(state, GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS, [address]) ||
    isInitialLoading(state, GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS, [address])
  )

  const wageredAmount = reduce(
    statistics?.tokenStats,
    (total, token) => add(convertToUSD(token.wagered?.amount, token.wagered?.erc20), total),
    0
  )

  if (Number(wageredAmount)) {
    statistics = set(statistics, ['stats', 'wagered'], { convertedAmount: wageredAmount, convertedCurrency: 'USD' })
  }

  const earnedAmount = reduce(
    statistics?.tokenStats,
    (total, token) => add(convertToUSD(token.earned?.amount, token.earned?.erc20), total),
    0
  )

  if (Number(earnedAmount)) {
    statistics = set(statistics, ['stats', 'earned'], { convertedAmount: earnedAmount, convertedCurrency: 'USD' })
  }

  return statistics
}

export function getMentorStatistics(state, address) {
  let statistics = get(state, ['statistics', address, 'mentor'])

  statistics = set(statistics, ['isLoading'],
    isInitialLoading(state, GET_BLOCKCHAIN_MENTOR_STATISTICS, [address])
  )

  const earnedAmount = reduce(
    statistics?.tokenStats,
    (total, token) => add(convertToUSD(token.earned.amount, token.earned.erc20), total),
    0
  )

  if (Number(earnedAmount)) {
    statistics = set(statistics, ['stats', 'earned'], { convertedAmount: earnedAmount, convertedCurrency: 'USD' })
  }

  return statistics
}

export function getStakerStatistics(state, address) {
  let statistics = get(state, ['statistics', address, 'staker'])

  statistics = set(statistics, ['isLoading'],
    isInitialLoading(state, GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS, [address]) ||
    isInitialLoading(state, GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS, [address]) ||
    isInitialLoading(state, GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, [address]) ||
    isInitialLoading(state, GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS, [address]) ||
    isInitialLoading(state, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID) ||
    isInitialLoading(state, GET_BLOCKCHAIN_EPOCH, [getActualEpochId(state), ORCY_ADDRESS])
  )

  const stake = get(statistics, ['stats', 'staked', 'amount'])
  const stakefund = get(getActualEpoch(state), ['stakefund'])
  let voting
  if (Number(stake) && Number(stakefund)) voting = div(stake, stakefund)

  if (voting) return set(statistics, ['stats', 'voting'], voting)

  return statistics

}