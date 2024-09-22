import React from 'react'
import PropTypes from 'prop-types'
import { formatDistanceUnixTS, formattedUnixTS } from '@oracly/pm-libs/date-utils'

import { GET_BLOCKCHAIN_DEPOSIT } from '@actions'
import { ERC20 } from '@constants'
import Status from '@components/common/Status'
import CurrencyLabeledField from '@components/common/CurrencyLabeledField'
import { deposit2TableData } from '@components/DepositsTable/DepositsTable.utils'
import AmountField from '@components/common/AmountField'
import { InfoTable } from '@components/InfoTable'
import { getDeposit, getEpoches } from '@state/getters'
import { isInitialLoading, getPageDataERC20 } from '@state/getters'
import { getActualEpochId } from '@state/getters'
import { connect } from '@state'

import css from './DepositModal.module.scss'

const DepositModal = ({
  erc20,
  deposit,
  actualEpochid,
  isInitialDepositLoading,
}) => {

  const { status, claimed } = deposit2TableData(deposit, { actualEpochid, erc20 })

  const depositStake = deposit?.stake || 0
  const depositStakingErc20 = deposit?.stakingErc20
  const depositStakedAt = deposit?.stakedAt
  const depositUnstakedAt = deposit?.unstakedAt || undefined
  const depositWithdrawnAt = deposit?.withdrawnAt || undefined
  const depositUnstaked = deposit?.unstaked
  const depositWithdrawn = deposit?.withdrawn

  return (
    <div className={css.container}>

      <CurrencyLabeledField
        className={css.stake}
        label="Deposit"
        amount={depositStake}
        currency={ERC20[depositStakingErc20]}
        isLoading={isInitialDepositLoading}
        withIcon
      />

      <InfoTable.Container>
        <InfoTable.Name>Status</InfoTable.Name>
        <InfoTable.Value><Status status={status} /></InfoTable.Value>
        <InfoTable.Divider />
        <InfoTable.Name>Claimed</InfoTable.Name>
        <InfoTable.Value>
          <AmountField
            amountClassName={css.fieldAmount}
            currency={ERC20[erc20]}
            amount={claimed}
          />
        </InfoTable.Value>
        <InfoTable.Divider />
        <InfoTable.Name>Staked</InfoTable.Name>
        <InfoTable.Value>
          {formatDistanceUnixTS(depositStakedAt)} ago
        </InfoTable.Value>
        <InfoTable.Divider />
        <InfoTable.Name>Created</InfoTable.Name>
        <InfoTable.Value>
          {formattedUnixTS(depositStakedAt)}
        </InfoTable.Value>
        {depositUnstaked && (
          <>
            <InfoTable.Divider />
            <InfoTable.Name>Unstaked</InfoTable.Name>
            <InfoTable.Value>
              {formattedUnixTS(depositUnstakedAt)}
            </InfoTable.Value>
          </>
        )}
        {depositWithdrawn && (
          <>
            <InfoTable.Divider />
            <InfoTable.Name>Withdrawn</InfoTable.Name>
            <InfoTable.Value>
              {formattedUnixTS(depositWithdrawnAt)}
            </InfoTable.Value>
          </>
        )}
      </InfoTable.Container>

    </div>
  )
}

DepositModal.propTypes = {
  depositid: PropTypes.string.isRequired,
}

export default connect(
  (state, { depositid }) => {
    const erc20 = getPageDataERC20(state)
    const deposit = getDeposit(state, depositid)
    const epoches = getEpoches(state)
    const isInitialDepositLoading = isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT, [depositid])
    const actualEpochid = getActualEpochId(state)

    return {
      erc20,
      deposit,
      epoches,
      actualEpochid,
      isInitialDepositLoading,
    }
  },
)(DepositModal)
