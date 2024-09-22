import React from 'react'
import { useParams } from 'react-router-dom'

import { GET_BLOCKCHAIN_DEPOSIT, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { LT } from '@constants'
import DepositPageHeader from '@components/DepositPageHeader'
import EpochesTable from '@components/EpochesTable'
import { useScheduledQuery } from '@hooks'
import { connect } from '@state'
import { getLatestbcBlockNumber, getPageDataERC20 } from '@state/getters'
import { isNeverPerformed } from '@state/getters'

const DepositPage = ({ is_bc_blockNumberExist, erc20 }) => {
  const { stakerid, depositid } = useParams()

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
    <>
      <DepositPageHeader
        stakerid={stakerid.toLowerCase()}
        depositid={depositid.toLowerCase()}
      />
      <EpochesTable
        stakerid={stakerid.toLowerCase()}
        depositid={depositid.toLowerCase()}
      />
    </>
  )
}

export default connect(
  (state) => {
    const erc20 = getPageDataERC20(state)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)

    return {
      erc20,
      is_bc_blockNumberExist,
    }
  },
)(DepositPage)