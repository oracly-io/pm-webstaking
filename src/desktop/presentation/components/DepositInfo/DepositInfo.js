import React from 'react'
import PropTypes from 'prop-types'
import { formatDistanceUnixTS } from '@oracly/pm-libs/date-utils'

import { GET_BLOCKCHAIN_DEPOSIT, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { WITHDRAW, UNSTAKE } from '@actions'
import { ERC20, LT } from '@constants'
import CurrencyLabeledField from '@components/common/CurrencyLabeledField'
import { useScheduledQuery } from '@hooks'
import { connect } from '@state'
import { getActiveAccountAddress, getLatestbcBlockNumber, isNeverPerformed } from '@state/getters'
import { getDeposit, getEpoches, isInitialLoading } from '@state/getters'
import { getPageDataERC20, getActualEpochId, isCommitingSuccess } from '@state/getters'

import Unstake from './Unstake'
import Withdraw from './Withdraw'

import css from './DepositInfo.module.scss'

const DepositInfo = (props) => {
  const {
    account,
    erc20,
    stakerid,
    depositid,
    deposit,
    actualEpochid,
    is_bc_blockNumberExist,
    isInitialDepositLoading,
    isInitialDepositPaidoutLoading,
    isUnstakeCommitingSuccess,
    isWithdrawCommitingSuccess,
  } = props

  const depositStake = deposit?.stake || 0
  const depositStakingErc20 = deposit?.stakingErc20
  const depositStakedAt = deposit?.stakedAt
  const depositStakedTo = deposit?.unstakedAt || undefined
  const depositUnstaked = deposit?.unstaked
  const depositWithdrawn = deposit?.withdrawn
  const isOwner = account && (account === stakerid)
  const unstakable = isOwner && actualEpochid && !depositUnstaked && !isUnstakeCommitingSuccess
  const withdrawnable = isOwner && depositUnstaked && !depositWithdrawn && !isWithdrawCommitingSuccess

  const period = formatDistanceUnixTS(depositStakedAt, depositStakedTo)
  const claimedAmount = deposit?.rewardfunds?.deposit?.[erc20]?.payout || 0

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_DEPOSIT, [depositid, LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE

    query(GET_BLOCKCHAIN_DEPOSIT, { depositid, loadType, txn: { blockNumber } }, { schedule: 300 })
  }, [is_bc_blockNumberExist, depositid])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, [depositid, erc20, LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE

    query(GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, { depositid, erc20, loadType, txn: { blockNumber } }, { schedule: 300 })
  }, [is_bc_blockNumberExist, depositid, erc20])

  return (
    <div className={css.container}>
      <div className={css.content}>
        <CurrencyLabeledField
          labelClassName={css.label}
          amountClassName={css.amount}
          currencyClassName={css.currency}
          contentClassName={css.currencyContent}
          label="Stake"
          amount={depositStake}
          currency={ERC20[depositStakingErc20]}
          isLoading={isInitialDepositLoading}
        />
        <CurrencyLabeledField
          labelClassName={css.label}
          amountClassName={css.amount}
          currencyClassName={css.currency}
          contentClassName={css.currencyContent}
          label="Claimed"
          amount={claimedAmount}
          currency={ERC20[erc20]}
          isLoading={isInitialDepositPaidoutLoading}
        />
        <div className={css.period}>Period:<span>{period}</span></div>
        {unstakable && <Unstake depositid={depositid} epochid={actualEpochid} />}
        {withdrawnable && <Withdraw depositid={depositid} />}
      </div>
    </div>
  )
}

DepositInfo.propTypes = {
  depositid: PropTypes.string.isRequired
}

export default connect(
  (state, { depositid }) => {
    const account = getActiveAccountAddress(state)
    const erc20 = getPageDataERC20(state)
    const deposit = getDeposit(state, depositid)
    const epoches = getEpoches(state)
    const isInitialDepositLoading = isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT, [depositid])
    const isInitialDepositPaidoutLoading = isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, [depositid, erc20])
    const actualEpochid = getActualEpochId(state)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)
    const isUnstakeCommitingSuccess = isCommitingSuccess(state, UNSTAKE, [depositid])
    const isWithdrawCommitingSuccess = isCommitingSuccess(state, WITHDRAW, [depositid])

    return {
      account,
      erc20,
      deposit,
      epoches,
      actualEpochid,
      is_bc_blockNumberExist,
      isInitialDepositLoading,
      isInitialDepositPaidoutLoading,
      isUnstakeCommitingSuccess,
      isWithdrawCommitingSuccess,
    }
  },
)(DepositInfo)