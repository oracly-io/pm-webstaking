import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PMGlobalHeader } from '@oracly/pm-react-components/app/mobile'
import { isEmpty, isString, toLower } from 'lodash'
import { useMatches, useParams, useNavigate } from 'react-router-dom'
import { useStore } from 'react-redux'
import { useWallet } from '@oracly/pm-libs/crypto-wallet'
import { success, fails } from '@oracly/pm-libs/redux-cqrs'

import { GET_BALANCE, SET_ACCOUNT, SET_SHOW_STATISTICS_BAR, UPDATE_NICKNAME } from '@actions'
import { RESOVLE_ADDRESS_TO_NICKNAME, REQUEST_AUTHENTICATION_PSIG } from '@actions'
import { WALLET_CONNECT, SET_PAGE_DATA } from '@actions'
import config from '@config'
import { ERC20, LT } from '@constants'
import HeaderContent from '@components/HeaderContent'
import { useScheduledQuery } from '@hooks'
import { useSupportBot } from '@hooks'
import { connect } from '@state'
import { getAccountNickname, getActiveAccountAddress, getLatestbcBlockNumber } from '@state/getters'
import { getNetworkStatus, getStatisticsBarIsOpened } from '@state/getters'
import { getActiveAccountBalanceERC20, getActiveAuthPersonalSignature } from '@state/getters'
import { getMentorStatistics, isLoading } from '@state/getters'
import { getPageDataERC20, getBettorStatistics } from '@state/getters'
import { getStakerStatistics } from '@state/getters'
import { getStatisticsBarAccount, isNeverPerformed } from '@state/getters'

const GlobalHeader = (props) => {
  const {
    erc20,
    nickname,
    psig,
    staker,
    balance,
    isConnecting,
    networkStatus,
    predictorStatistics,
    mentorStatistics,
    stakerStatistics,
    statisticsBarAccount,
    isStatisticsBarOpened,
    is_bc_blockNumberExist,
    statisticsBarNickname,
  } = props
  const [injectedProviderType, setInjectedProviderType] = useState()

  const navigate = useNavigate()
  const wallet = useWallet()
  const { stakerid } = useParams()
  const matches = useMatches()
  const isConnected = !!(wallet && wallet.ready && wallet.chain && toLower(wallet.account) === staker)
  const account = toLower(wallet.account)
  const currency = ERC20[erc20]
  const mustUserLogin = !window.localStorage.getItem('__connector') &&
    !stakerid && matches.length === 1 // open only for index page

  const connectors = useMemo(
    () => {
      if (window.ethereum) {
        if (window.ethereum.isMetaMask) {
          return wallet.connectors.filter((con) => con === 'injected')
        }
        if (window.ethereum.isCoinbaseWallet) {
          return wallet.connectors.filter((con) => con === 'coinbase')
        }
        return wallet.connectors.filter((con) => con === 'walletconnect')
      } else {
        return wallet.connectors.filter((con) => con !== 'injected')
      }
    },
    [wallet.connectors]
  )

  useEffect(() => {
    if (connectors.includes('injected')) {
      if (window.ethereum) {
        setInjectedProviderType(window.ethereum?.isUniswapWallet ? 'uniswap' : 'metamask')
      } else {
        setInjectedProviderType('uniswap')
      }
    }
  }, [connectors])

  const statistics = useMemo(() => {
    return {
      predictor: predictorStatistics,
      mentor: mentorStatistics,
      staker: stakerStatistics,
    }
  }, [predictorStatistics, mentorStatistics, stakerStatistics])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    if (account && erc20) {
      const blockNumber = getLatestbcBlockNumber(state)
      const isLoadNeverPerformed = isNeverPerformed(state, GET_BALANCE, [erc20, account, LT.INITIAL])
      const loadType = isLoadNeverPerformed ? LT.INITIAL : LT.UPDATE
      query(GET_BALANCE, { account, erc20, loadType, txn: { blockNumber } }, { schedule: 30 })
    }
  }, [is_bc_blockNumberExist, account, erc20])

  useEffect(() => {
    if (wallet.ready && account) {
      props.SET_ACCOUNT({ account })
    }
  }, [wallet.ready, account])

  useEffect(() => {
    props.WALLET_CONNECT()
    wallet.actions.connectEagerly()
      .then(() => props.WALLET_CONNECT_SUCCESS())
      .catch(() => props.WALLET_CONNECT_FAILS())
  }, [])

  useEffect(() => {
    if (!wallet.ready) return
    if (!wallet.chain) return
    if (!account) return
    if (account !== staker) return
    if (!isEmpty(psig)) return
    if (!isString(nickname)) return

    props.REQUEST_AUTHENTICATION_PSIG({ nickname, from: account })

  }, [psig, wallet.chain, wallet.ready, account, staker, nickname])

  useEffect(() => {
    if (!wallet.ready) return
    if (!wallet.chain) return
    if (!account) return
    if (account !== staker) return
    if (isString(props.nickname)) return

    props.RESOVLE_ADDRESS_TO_NICKNAME({ address: account })

  }, [wallet.chain, wallet.ready, account, staker, nickname])

  const handleDisconnectClick = useCallback(() => {
    props.SET_SHOW_STATISTICS_BAR({ isOpened: false })
    if (wallet.ready) {
      wallet.actions.disconnect()
      props.SET_ACCOUNT({ account: null })
    }
  }, [wallet])

  const handleProfileClick = useCallback(() => {
    props.SET_SHOW_STATISTICS_BAR({ account, isOpened: true })
  }, [account])

  const handleStatisticsBarCloseClick = useCallback(() => {
    props.SET_SHOW_STATISTICS_BAR({ isOpened: false })
  }, [])

  const store = useStore()

  const handleConnectorClick = useCallback((connectorId) => {
    // NOTE: it's handled via standard async
    // so we HAVE TO call sucess and fails
    props.WALLET_CONNECT(connectorId)
    wallet.actions.connect(connectorId)
      .then(() => {
        props.WALLET_CONNECT_SUCCESS(connectorId)
        navigate(getActiveAccountAddress(store.getState()))
      })
      .catch(() => props.WALLET_CONNECT_FAILS(connectorId))

  }, [])

  const handelProfileIconClick = useCallback(() => {
    props.SET_SHOW_STATISTICS_BAR({ account, isOpened: true })
  }, [account])

  const handleProfileCurrencyChanged = useCallback((currency) => {
    props.SET_PAGE_DATA({ erc20: ERC20.ADDRESS[currency] })
  }, [])

  const handleNicknameChanged = useCallback(({ address, nickname }) => {
    props.UPDATE_NICKNAME({ address, nickname })
  }, [])

  const [handleSupportClick,] = useSupportBot()

  return (
    <PMGlobalHeader
      injectedProviderType={injectedProviderType}
      basepath={config.st_base_path}
      account={account}
      statisticsAccount={statisticsBarAccount}
      statisticsNickname={statisticsBarNickname}
      mustUserLogin={mustUserLogin}
      connectors={connectors}
      activeNavigationItem="staking"
      currencyFill="#3D2756"
      maximumFractionDigits={config.maximum_fraction_digits}
      maximumFractionDigitsPrecent={config.maximum_fraction_digits_precent}
      content={(
        <HeaderContent
          isConnected={isConnected}
          balance={balance}
          currency={currency}
          account={account}
          networkStatus={networkStatus}
          onProfileIconClick={handelProfileIconClick}
          onProfileCurrencyChanged={handleProfileCurrencyChanged}
        />
      )}
      isConnecting={isConnecting}
      isConnected={isConnected}
      isStatisticsBarOpened={isStatisticsBarOpened}
      statistics={statistics}
      onProfileClick={handleProfileClick}
      onDisconnectClick={handleDisconnectClick}
      onConnectorClick={handleConnectorClick}
      onStatisticsBarCloseClick={handleStatisticsBarCloseClick}
      onSupportClick={handleSupportClick}
      onNicknameChanged={handleNicknameChanged}
    >
      {props.children}
    </PMGlobalHeader>
  )
}

export default connect(
  state => {
    const erc20 = getPageDataERC20(state)
    const balance = getActiveAccountBalanceERC20(state, erc20)
    const statisticsBarAccount = getStatisticsBarAccount(state)
    const predictorStatistics = getBettorStatistics(state, statisticsBarAccount)
    const stakerStatistics = getStakerStatistics(state, statisticsBarAccount)
    const mentorStatistics = getMentorStatistics(state, statisticsBarAccount)
    const staker = getActiveAccountAddress(state)
    const isConnecting = isLoading(state, WALLET_CONNECT)
    const nickname = getAccountNickname(state, staker)
    const psig = getActiveAuthPersonalSignature(state)
    const isStatisticsBarOpened = getStatisticsBarIsOpened(state)
    const networkStatus = getNetworkStatus(state)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)
    const statisticsBarNickname = getAccountNickname(state, statisticsBarAccount)

    return {
      erc20,
      balance,
      staker,
      nickname,
      psig,
      isConnecting,
      predictorStatistics,
      mentorStatistics,
      stakerStatistics,
      isStatisticsBarOpened,
      statisticsBarAccount,
      networkStatus,
      is_bc_blockNumberExist,
      statisticsBarNickname,
    }
  },
  ({ query, command }) => [
    command(SET_SHOW_STATISTICS_BAR),
    command(SET_ACCOUNT),
    command(WALLET_CONNECT),
    command(SET_PAGE_DATA),
    command(UPDATE_NICKNAME),
    command(success(WALLET_CONNECT)),
    command(fails(WALLET_CONNECT)),

    query(RESOVLE_ADDRESS_TO_NICKNAME),
    query(REQUEST_AUTHENTICATION_PSIG),
  ]
)(React.memo(GlobalHeader))
