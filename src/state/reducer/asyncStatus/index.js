import { findAction } from '@oracly/pm-libs/redux-cqrs'

import { CLAIM_REWARD, AWAIT_TRANSACTION } from '@actions'
import { UNSTAKE, WITHDRAW, STAKE } from '@actions'
import { WALLET_CONNECT, GET_BLOCKCHAIN_TABLE_DEPOSITS } from '@actions'
import { GET_BLOCKCHAIN_ACTUAL_EPOCH_ID } from '@actions'
import { GET_BLOCKCHAIN_EPOCH, GET_BLOCKCHAIN_STAKER_STAKE } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { APPROVE_ACCOUNT_ALLOWANCE } from '@actions'
import { GET_BLOCKCHAIN_BUY_4_STAKEPOOL } from '@actions'
import { GET_ALLOWANCE, GET_BALANCE } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_LAST_DEPOSIT } from '@actions'
import { toDepositRewardfundKey } from '@state/mappers'
import { reducer } from '@state/async'
import { combine } from '@lib/reducer-utils'
import { GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT } from '@actions'
import { BUY_FOR_STAKE, GET_BLOCKCHAIN_DEPOSIT } from '@actions'
import { GET_BLOCKCHAIN_MENTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS } from '@actions'

export default combine({
  [GET_BALANCE]: reducer(GET_BALANCE, ({ account, erc20, loadType }) => [erc20, account, loadType].filter(i => i).join('.')),
  [GET_BLOCKCHAIN_BUY_4_STAKEPOOL]: reducer(GET_BLOCKCHAIN_BUY_4_STAKEPOOL, ({ loadType }) => loadType),
  [GET_BLOCKCHAIN_ACTUAL_EPOCH_ID]: reducer(GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, ({ loadType }) => loadType),
  [GET_BLOCKCHAIN_EPOCH]: reducer(GET_BLOCKCHAIN_EPOCH, ({ loadType, erc20, epochid }) =>
    [epochid, erc20, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_STAKE]: reducer(GET_BLOCKCHAIN_STAKER_STAKE, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_PAIDOUT]: reducer(GET_BLOCKCHAIN_STAKER_PAIDOUT, ({ loadType, erc20, stakerid }) =>
    [stakerid, erc20, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_DEPOSIT]: reducer(GET_BLOCKCHAIN_DEPOSIT, ({ loadType, depositid }) =>
    [depositid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_DEPOSIT_PAIDOUT]: reducer(GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, ({ loadType, erc20, depositid }) =>
    [depositid, erc20, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT]: reducer(GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT, ({ loadType, erc20, epochid, depositid }) =>
    [depositid, erc20, epochid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_TABLE_DEPOSITS]: reducer(GET_BLOCKCHAIN_TABLE_DEPOSITS, ({ loadType }) => ['', loadType]),
  [GET_BLOCKCHAIN_BETTOR_STATISTICS]: reducer(GET_BLOCKCHAIN_BETTOR_STATISTICS, ({ loadType, bettorid }) =>
    [bettorid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS]: reducer(GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS, ({ loadType, bettorid }) =>
    [bettorid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS]: reducer(GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS, ({ loadType, bettorid }) =>
    [bettorid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_MENTOR_STATISTICS]: reducer(GET_BLOCKCHAIN_MENTOR_STATISTICS, ({ loadType, mentorid }) =>
    [mentorid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_LAST_DEPOSIT]: reducer(GET_BLOCKCHAIN_LAST_DEPOSIT, ({ stakerid }) => stakerid),
  [STAKE]: reducer(STAKE),
  [BUY_FOR_STAKE]: reducer(BUY_FOR_STAKE),
  [UNSTAKE]: reducer(UNSTAKE, ({ depositid }) => depositid),
  [WITHDRAW]: reducer(WITHDRAW, ({ depositid }) => depositid),
  [CLAIM_REWARD]: reducer(CLAIM_REWARD, ({ depositid, epochid, erc20 }) =>
    toDepositRewardfundKey({ depositid, epochid, erc20 })
),
  [GET_ALLOWANCE]: reducer(GET_ALLOWANCE, ({ account, erc20 }) =>
    [erc20, account].filter(i => i).join('.')
  ),
  [APPROVE_ACCOUNT_ALLOWANCE]: reducer(APPROVE_ACCOUNT_ALLOWANCE, ({ erc20 }) => erc20),
  [WALLET_CONNECT]: reducer(WALLET_CONNECT),
  [AWAIT_TRANSACTION]: reducer(AWAIT_TRANSACTION, (_, { origin }) => {
    const action_CLAIM_REWARD = findAction(origin, CLAIM_REWARD)
    if (action_CLAIM_REWARD) return `${CLAIM_REWARD}.${toDepositRewardfundKey(action_CLAIM_REWARD.args)}`
    const action_UNSTAKE = findAction(origin, UNSTAKE)
    if (action_UNSTAKE) return `${UNSTAKE}.${action_UNSTAKE.args.depositid}`
    const action_WITHDRAW = findAction(origin, WITHDRAW)
    if (action_WITHDRAW) return `${WITHDRAW}.${action_WITHDRAW.args.depositid}`
    const action_STAKE = findAction(origin, STAKE)
    if (action_STAKE) return STAKE
    const action_BUY_FOR_STAKE = findAction(origin, BUY_FOR_STAKE)
    if (action_BUY_FOR_STAKE) return BUY_FOR_STAKE
    const action_APPROVE_ACCOUNT_ALLOWANCE = findAction(origin, APPROVE_ACCOUNT_ALLOWANCE)
    if (action_APPROVE_ACCOUNT_ALLOWANCE) return `${APPROVE_ACCOUNT_ALLOWANCE}.${action_APPROVE_ACCOUNT_ALLOWANCE.args.erc20}`
  }),
})
