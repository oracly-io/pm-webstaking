import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { formatDistanceUnixTS } from '@oracly/pm-libs/date-utils'

import { GET_BLOCKCHAIN_DEPOSIT, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { UNSTAKE, WITHDRAW } from '@actions'
import { ORCY_ADDRESS, ERC20 } from '@constants'
import RouteBackIcon from '@components/SVG/RouteBackIcon'
import CurrencyField from '@components/common/CurrencyField'
import LabeledField from '@components/common/LabeledField'
import CurrencyLabeledField from '@components/common/CurrencyLabeledField'
import { connect } from '@state'
import { getActualEpochId, isInitialLoading } from '@state/getters'
import { getDeposit, getPageDataERC20 } from '@state/getters'
import { getActiveAccountAddress } from '@state/getters'
import { isCommitingSuccess } from '@state/getters'

import Unstake from './Unstake'
import Withdraw from './Withdraw'

import css from './DepositPageHeader.module.scss'

const DepositPageHeader = ({
  erc20,
  account,
  stakerid,
  depositid,
  deposit,
  actualEpochid,
  isInitialDepositLoading,
  isInitialDepositPaidoutLoading,
  isUnstakeCommitingSuccess,
  isWithdrawCommitingSuccess,
}) => {
  const depositStake = deposit?.stake || 0
  const depositStakingErc20 = deposit?.stakingErc20 || ORCY_ADDRESS
  const depositStakedAt = deposit?.stakedAt
  const depositStakedTo = deposit?.unstakedAt || undefined
  const depositUnstaked = deposit?.unstaked
  const depositWithdrawn = deposit?.withdrawn
  const isOwner = account && (account === stakerid)
  const unstakable = isOwner && actualEpochid && !depositUnstaked && !isUnstakeCommitingSuccess
  const withdrawnable = isOwner && depositUnstaked && !depositWithdrawn && !isWithdrawCommitingSuccess
  const period = formatDistanceUnixTS(depositStakedAt, depositStakedTo)

  const navigate = useNavigate()
  const handleGoback = useCallback(() => navigate('..', { relative: 'path' }), [navigate])

  const claimedAmount = deposit?.rewardfunds?.deposit?.[erc20]?.payout || 0

  return (
    <div className={css.container}>
      <div className={css.top}>
        <div className={css.goback} onClick={handleGoback}>
          <RouteBackIcon />
        </div>
        <CurrencyField
          className={css.stakeField}
          amount={depositStake}
          isLoading={isInitialDepositLoading}
          currency={ERC20[depositStakingErc20]}
        />
      </div>
      <div className={css.divider}></div>
      <div className={css.details}>
        <CurrencyLabeledField
          amountClassName={css.currencyAmount}
          contentClassName={css.labeledFieldContent}
          label="Claimed"
          amount={claimedAmount}
          currency={ERC20[erc20]}
          isLoading={isInitialDepositPaidoutLoading}
        />
        <LabeledField
          isLoading={isInitialDepositLoading}
          contentClassName={css.labeledFieldContent}
          label="Period"
        >
          <span className={css.period}>{period}</span>
        </LabeledField>
      </div>
      {unstakable && <Unstake depositid={depositid} epochid={actualEpochid} />}
      {withdrawnable && <Withdraw depositid={depositid} />}
    </div>
  )
}

DepositPageHeader.propTypes = {
  depositid: PropTypes.string.isRequired
}

export default connect(
  (state, { depositid }) => {
    const erc20 = getPageDataERC20(state)
    const deposit = getDeposit(state, depositid)
    const actualEpochid = getActualEpochId(state)
    const account = getActiveAccountAddress(state)
    const isInitialDepositLoading = isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT, [depositid])
    const isInitialDepositPaidoutLoading = isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, [depositid, erc20])
    const isUnstakeCommitingSuccess = isCommitingSuccess(state, UNSTAKE, [depositid])
    const isWithdrawCommitingSuccess = isCommitingSuccess(state, WITHDRAW, [depositid])

    return {
      account,
      erc20,
      deposit,
      actualEpochid,
      isInitialDepositLoading,
      isInitialDepositPaidoutLoading,
      isUnstakeCommitingSuccess,
      isWithdrawCommitingSuccess,
    }
  },
)(DepositPageHeader)