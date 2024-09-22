import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { set } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import { GET_BLOCKCHAIN_TABLE_DEPOSITS } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT } from '@actions'
import { GET_BLOCKCHAIN_LAST_DEPOSIT } from '@actions'
import { blockchain2Deposit, blockchain2DepositMap } from '@state/mappers'
import { updateEntitiesFactory } from '@state/reducer/utils'

const updateBlockchainDeposits = updateEntitiesFactory(blockchain2Deposit)

export default {
  metadata: {
    default: {
      collection: {},
    },
  },

  [success(GET_BLOCKCHAIN_DEPOSIT)]: (state, { txn, result: bcdeposit }) => {

    const depositMap = blockchain2DepositMap(bcdeposit)
    state = updateBlockchainDeposits(state, [depositMap], txn.blockNumber)

    return state
  },


  [success(GET_BLOCKCHAIN_TABLE_DEPOSITS)]: (state, { stakerid, txn, result }) => {

    const [bcdeposits, size] = result
    if (size === '0') return state

    const depositMaps = bcdeposits.map((bcdeposit) => blockchain2DepositMap(bcdeposit))
    state = updateBlockchainDeposits(state, depositMaps, txn.blockNumber)
    state = set(state, ['collection_by_address_size', stakerid], size)

    return state
  },

  [success(GET_BLOCKCHAIN_DEPOSIT_PAIDOUT)]: (state, { depositid, erc20, txn, result: payout }) => {

    const updateDepositPayout = updateEntitiesFactory(
      payout => toDecimalERC20(payout, erc20),
      () => [depositid, 'rewardfunds', 'deposit', erc20, 'payout'],
      () => `${depositid}.${erc20}.deposit.payout`,
    )
    state = updateDepositPayout(state, payout, txn.blockNumber)

    return state

  },

  [success(GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT)]: (state, { depositid, epochid, erc20, txn, result: payout }) => {

    const updateDepositEpochPayout = updateEntitiesFactory(
      payout => toDecimalERC20(payout, erc20),
      () => [depositid, 'rewardfunds', 'epoch', erc20, epochid, 'payout'],
      () => `${depositid}.${erc20}.epoch.${epochid}.payout`,
    )

    state = updateDepositEpochPayout(state, payout, txn.blockNumber)

    return state
  },

  [success(GET_BLOCKCHAIN_LAST_DEPOSIT)]: (state, { stakerid, txn, result }) => {

    const [[bcdeposit], size] = result
    if (size === '0') return state

    const depositMap = blockchain2DepositMap(bcdeposit)

    state = updateBlockchainDeposits(state, [depositMap], txn.blockNumber)

    state = set(state, ['last_by_address', stakerid], depositMap.depositid)

    return state
  },

}
