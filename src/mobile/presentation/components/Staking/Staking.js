import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, toLower } from 'lodash'
import { useWallet } from '@oracly/pm-libs/crypto-wallet'

import { GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, GET_BLOCKCHAIN_EPOCH } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT, GET_BLOCKCHAIN_STAKER_STAKE } from '@actions'
import { LT } from '@constants'
import Button from '@components/common/Button'
import StakingModal from '@components/StakingModal'
import { useModal, useScheduledQuery } from '@hooks'
import { connect } from '@state'
import { getActiveAccountAddress, getActualEpochId } from '@state/getters'
import { getLatestbcBlockNumber } from '@state/getters'
import { getPageDataERC20, isNeverPerformed } from '@state/getters'

import css from './Staking.module.scss'

const modalClasses = {
  base: css.modalBase
}

const Staking = ({ erc20, account, actualEpochId, is_bc_blockNumberExist }) => {
  let { stakerid } = useParams()
  stakerid = toLower(stakerid)
  const wallet = useWallet()

  const isConnected = !!(wallet.ready && wallet.chain)

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, [LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE
    query(GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, { loadType, txn: { blockNumber } }, { schedule: 300 })
  }, [is_bc_blockNumberExist])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return
    if (isEmpty(actualEpochId)) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_EPOCH, [actualEpochId, erc20, LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE
    query(GET_BLOCKCHAIN_EPOCH, { epochid: actualEpochId, erc20, loadType, txn: { blockNumber } }, { schedule: 300 })
  }, [is_bc_blockNumberExist, actualEpochId, erc20])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return
    if (!stakerid) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_STAKE, [stakerid, LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE
    query(GET_BLOCKCHAIN_STAKER_STAKE, { stakerid, loadType, txn: { blockNumber } }, { schedule: 30 })
  }, [is_bc_blockNumberExist, stakerid])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return
    if (!stakerid) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_PAIDOUT, [stakerid, erc20, LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE
    query(GET_BLOCKCHAIN_STAKER_PAIDOUT, { stakerid, erc20, loadType, txn: { blockNumber } }, { schedule: 30 })
  }, [is_bc_blockNumberExist, stakerid, erc20])

  const { modal, open: openModal } = useModal({
    type: 'secondary',
    Content: StakingModal,
    modalClasses,
  })

  return (
    <>
      {isConnected && account && (
        <Button className={css.stakeBtn} onClick={openModal}>
          Stake
        </Button>
      )}
      {modal}
    </>
  )
}

export default connect(
  (state) => {
    const account = getActiveAccountAddress(state)
    const erc20 = getPageDataERC20(state)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)
    const actualEpochId = getActualEpochId(state)

    return {
      account,
      erc20,
      actualEpochId,
      is_bc_blockNumberExist,
    }
  }
)(Staking)