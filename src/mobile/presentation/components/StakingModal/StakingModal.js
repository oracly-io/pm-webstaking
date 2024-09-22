import React, { useCallback, useEffect } from 'react'
import BalanceCurrency from '@oracly/pm-react-components/app/mobile/components/common/BalanceCurrency'
import cn from 'clsx'
import { fromDecimalERC20, gt, gte, isNegative, isPositive } from '@oracly/pm-libs/calc-utils'
import { htmlCurrency } from '@oracly/pm-libs/html-utils'

import { STAKE, GET_BALANCE } from '@actions'
import { APPROVE_ACCOUNT_ALLOWANCE, GET_ALLOWANCE } from '@actions'
import { BUY_FOR_STAKE, SET_PAGE_DATA } from '@actions'
import { GET_BLOCKCHAIN_BUY_4_STAKEPOOL } from '@actions'
import { GET_BLOCKCHAIN_LAST_DEPOSIT } from '@actions'
import config from '@config'
import { LT, ERC20, ORCY_ADDRESS, USDC_ADDRESS } from '@constants'
import Spinner from '@components/common/Spinner'
import Info from '@components/SVG/Info'
import BlockIcon from '@components/SVG/Block'
import { useScheduledQuery, useEffectState } from '@hooks'
import { useChangeERC20 } from '@hooks'
import { connect } from '@state'
import { getActiveAccountAddress, getPageDataStakingErc20 } from '@state/getters'
import { getBuy4StakePool, getLatestbcBlockNumber } from '@state/getters'
import { isInitialLoading, isNeverPerformed } from '@state/getters'
import { getPageDataStake, isInsufficientAllowance, isLoading } from '@state/getters'
import { getActiveAccountBalanceERC20, getActualEpochId } from '@state/getters'
import { isCommiting, hasUnstakedActualDeposit } from '@state/getters'
import { getLastDepositidByAddress } from '@state/getters'

import StakingDropdown from './StakingDropdown'

import css from './StakingModal.module.scss'

const StakingModal = (props) => {
  const {
    account,
    actualEpochid,
    balance,
    balance_ORCY,
    stake = '',
    insufficientAllowance,
    erc20,
    is_bc_blockNumberExist,
    buy4StakePool,
    hasUnstakedActualDeposit,
    isInitialLoadingBuy4StakePool,
    isInitialLoadingBalance_ORCY,
    isLoading,
  } = props

  const is_USDC_Staking = erc20 === USDC_ADDRESS
  const is_ORCY_Staking = erc20 === ORCY_ADDRESS

  let isInitialAvailableLoading = false
  if (is_USDC_Staking) isInitialAvailableLoading = isInitialLoadingBuy4StakePool
  if (is_ORCY_Staking) isInitialAvailableLoading = isInitialLoadingBalance_ORCY

  let availableAmount = null
  if (is_USDC_Staking) availableAmount = buy4StakePool
  if (is_ORCY_Staking) availableAmount = balance_ORCY

  const [difference, changeid] = useChangeERC20(account, availableAmount, erc20)

  const disabledSubmit =
    !Number(stake) ||
    isLoading ||
    isInitialAvailableLoading ||
    (!Number(buy4StakePool) && is_USDC_Staking) ||
    hasUnstakedActualDeposit ||
    !actualEpochid

  const disabledInput =
    isLoading ||
    isInitialAvailableLoading ||
    hasUnstakedActualDeposit ||
    !actualEpochid

  const disabledDropdown = hasUnstakedActualDeposit || !actualEpochid

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    if (is_ORCY_Staking && account) {
      const blockNumber = getLatestbcBlockNumber(state)
      const isLoadNeverPerformed = isNeverPerformed(state, GET_BALANCE, [ORCY_ADDRESS, account, LT.INITIAL])
      const loadType = isLoadNeverPerformed ? LT.INITIAL : LT.UPDATE
      query(GET_BALANCE, { account, erc20: ORCY_ADDRESS, loadType, txn: { blockNumber } }, { schedule: 30 })
    }
  }, [is_bc_blockNumberExist, is_ORCY_Staking, account])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    if (is_USDC_Staking) {
      const blockNumber = getLatestbcBlockNumber(state)
      const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_BUY_4_STAKEPOOL, [LT.INITIAL])
        ? LT.INITIAL : LT.UPDATE
      query(GET_BLOCKCHAIN_BUY_4_STAKEPOOL, { loadType, txn: { blockNumber } }, { schedule: 120 })
    }
  }, [is_bc_blockNumberExist, is_USDC_Staking])

  useEffectState((state) => {
    if (
      is_bc_blockNumberExist &&
      account &&
      !getLastDepositidByAddress(state, account) &&
      isNeverPerformed(state, GET_BLOCKCHAIN_LAST_DEPOSIT, [account])
    ) {
      const blockNumber = getLatestbcBlockNumber(state)
      props.GET_BLOCKCHAIN_LAST_DEPOSIT({ stakerid: account, txn: { blockNumber } })
    }
  }, [is_bc_blockNumberExist, account])

  useEffect(() => {
    if (hasUnstakedActualDeposit) props.SET_PAGE_DATA({ stake: '', stakingErc20: ORCY_ADDRESS })
  }, [hasUnstakedActualDeposit])

  const handleChange = (e) => {
    if (disabledInput) return

    const newvalue = e.target.value
    const maxvalue = is_USDC_Staking ? Math.min(balance, buy4StakePool) : balance

    if (gte(maxvalue, newvalue) && /^\d+\.?\d{0,4}$/.test(newvalue)) props.SET_PAGE_DATA({ stake: newvalue })
    else if (gt(newvalue, maxvalue)) props.SET_PAGE_DATA({ stake: maxvalue })
    else if (newvalue === '') props.SET_PAGE_DATA({ stake: newvalue })
  }

  const handleSubmit = useCallback((erc20) => {

    if (disabledSubmit) return

    const stakeArgs = {
      epochid: actualEpochid,
      amount: fromDecimalERC20(stake, erc20),
      stakerid: account,
      erc20,
    }

    if (insufficientAllowance) {
      props.APPROVE_ACCOUNT_ALLOWANCE({
        erc20,
        amount: fromDecimalERC20(balance, erc20),
        stakeArgs,
      })
    } else {
      if (is_USDC_Staking) props.BUY_FOR_STAKE(stakeArgs)
      if (is_ORCY_Staking) props.STAKE(stakeArgs)
    }

    props.SET_PAGE_DATA({ stake: '' })

  }, [
    disabledSubmit,
    insufficientAllowance,
    stake,
    actualEpochid,
    account,
    is_USDC_Staking,
    is_ORCY_Staking,
  ])

  const handleERC20Change = useCallback((erc20) => {
    props.SET_PAGE_DATA({ stake: '', stakingErc20: erc20 })
  }, [])

  let htmldifference = htmlCurrency(difference)
  if (htmldifference.includes('<-')) htmldifference = `-<${htmldifference.slice(2)}`

  return (
    <div className={css.container}>

      <div className={css.title}>Stake</div>

      <div
        key={changeid}
        className={cn(css.available, {
          [css.increase]: difference && isPositive(difference),
          [css.decrease]: difference && isNegative(difference),
        })}
      >
        <BalanceCurrency
          fill="#D4BDE9"
          currency={ERC20[ORCY_ADDRESS]}
          className={css.icon}
        />

        {isInitialAvailableLoading ? (
          <Spinner className={css.spinner} />
        ) : (
          <span className={css.quantity}>
            {availableAmount ? htmlCurrency(availableAmount) : 0}
          </span>
        )}

        <span className={css.difference}>
          <span>+</span>
          {htmldifference}
        </span>

        {is_ORCY_Staking &&
          <span>Balance</span>
        }

        {is_USDC_Staking &&
          <span>Buy4Stake Pool</span>
        }
      </div>

      {is_USDC_Staking && (
        <div className={css.info}>
          <Info />
          <span className={css.text}>
            {config.buy_for_stake_info}
          </span>
        </div>
      )}

      {is_ORCY_Staking && hasUnstakedActualDeposit && (
        <div className={css.info}>
          <BlockIcon />
          <span className={css.text}>
            {config.block_stake_info}
          </span>
        </div>
      )}

      <input
        type="number"
        className={cn(css.amount, { [css.disabled]: disabledInput })}
        placeholder="Amount"
        value={stake}
        onChange={handleChange}
        disabled={disabledInput}
      />

      <StakingDropdown
        erc20={erc20}
        disabled={disabledSubmit}
        disabledDropdown={disabledDropdown}
        isLoading={isLoading}
        onClick={handleSubmit}
        onChange={handleERC20Change}
      />
    </div>
  )
}

 export default connect(
  (state) => {
    const erc20 = getPageDataStakingErc20(state)
    const account = getActiveAccountAddress(state)
    const balance = getActiveAccountBalanceERC20(state, erc20)
    const balance_ORCY = getActiveAccountBalanceERC20(state, ORCY_ADDRESS)
    const commiting = isCommiting(state, STAKE) ||
      isCommiting(state, BUY_FOR_STAKE) ||
      isCommiting(state, APPROVE_ACCOUNT_ALLOWANCE, [erc20])
    const isAllowanceLoading = isLoading(state, GET_ALLOWANCE, [erc20, account])
    const isInLoading = isAllowanceLoading || commiting
    const actualEpochid = getActualEpochId(state)
    const insufficientAllowance = isInsufficientAllowance(state, erc20)
    const stake = getPageDataStake(state)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)
    const buy4StakePool = getBuy4StakePool(state)
     const isInitialLoadingBuy4StakePool = isInitialLoading(state, GET_BLOCKCHAIN_BUY_4_STAKEPOOL)
     const isInitialLoadingBalance_ORCY = isInitialLoading(state, GET_BALANCE, [ORCY_ADDRESS, account])

    return {
      erc20,
      account,
      actualEpochid,
      balance,
      balance_ORCY,
      stake,
      insufficientAllowance,
      is_bc_blockNumberExist,
      buy4StakePool,
      hasUnstakedActualDeposit: hasUnstakedActualDeposit(state, account),
      isInitialLoadingBuy4StakePool,
      isInitialLoadingBalance_ORCY,
      isLoading: isInLoading,
    }
  },
   ({ query, command }) => [
     query(GET_BLOCKCHAIN_LAST_DEPOSIT),
     query(APPROVE_ACCOUNT_ALLOWANCE),

    command(STAKE),
    command(BUY_FOR_STAKE),
    command(SET_PAGE_DATA),
  ]
)(StakingModal)
