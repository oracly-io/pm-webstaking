import { isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useState } from 'react'
import { get } from '@oracly/pm-libs/immutable'

import { GET_BLOCKCHAIN_DEPOSIT, GET_BLOCKCHAIN_EPOCH } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT } from '@actions'
import { LT } from '@constants'
import Table from '@components/common/Table'
import ClaimModal from '@components/ClaimModal'
import { useModal, useEffectState } from '@hooks'
import { connect } from '@state'
import { getLatestbcBlockNumber, getPageDataERC20, isNeverPerformed } from '@state/getters'
import { getActiveAccountAddress } from '@state/getters'
import { isInitialLoading } from '@state/getters'
import { getEpoches, getDeposit, getActualEpochId } from '@state/getters'
import { generateDepositEpochids } from '@utils'

import { useColumns, epoch2TableData } from './EpochesTable.utils'
import EpochesTableRow from './EpochesTableRow'

import css from './EpochesTable.module.scss'

const EpochesTable = (props) => {
  const {
    erc20,
    account,
    epoches,
    depositid,
    deposit,
    stakerid,
    actualEpochid,
    is_bc_blockNumberExist,
    isInitialLoading,
  } = props

  const stake = deposit?.stake
  const epochStaked = deposit?.epochStaked
  const epochUnstaked = deposit?.epochUnstaked
  const withdrawn = deposit?.withdrawn
  const columns = useColumns({ showClaim: account === stakerid })

  const { modal, open: openModal } = useModal({
    type: 'secondary',
    Content: ClaimModal,
  })

  const [renderedEpochids, setRenderedEpochids] = useState([])

  const epochids = useMemo(() =>
    generateDepositEpochids(epochStaked, epochUnstaked, actualEpochid),
  [epochStaked, epochUnstaked, actualEpochid])

  useEffectState((state) => {
    if (!is_bc_blockNumberExist) return

    const blockNumber = getLatestbcBlockNumber(state)

    for (const epochid of renderedEpochids) {
      if (isNeverPerformed(state, GET_BLOCKCHAIN_EPOCH, [epochid, erc20, LT.INITIAL])) {
        props.GET_BLOCKCHAIN_EPOCH({ epochid, erc20, loadType: LT.INITIAL, txn: { blockNumber } })
      }
    }

  }, [is_bc_blockNumberExist, renderedEpochids, erc20])

  useEffectState((state) => {
    if (!is_bc_blockNumberExist) return

    const blockNumber = getLatestbcBlockNumber(state)

    for (const epochid of renderedEpochids) {
      if (isNeverPerformed(state, GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT, [depositid, erc20, epochid, LT.INITIAL])) {
        props.GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT({ depositid, epochid, erc20, loadType: LT.INITIAL, txn: { blockNumber } })
      }
    }

  }, [is_bc_blockNumberExist, renderedEpochids, depositid, erc20])

  const depositEpochRewardfunds = get(deposit, ['rewardfunds', 'epoch'])

  const rowGetter = useCallback(({ index }) => {
    const epochid = epochids[index]
    const payout = get(depositEpochRewardfunds, [erc20, epochid, 'payout']) || 0
    const epoch = epoches?.[epochid]

    if (isEmpty(epoch)) return { epochid, erc20, depositid }

    return epoch2TableData(
      epoch,
      {
        erc20,
        actualEpochid,
        payout,
        stake,
        depositid,
        epochStaked,
        epochUnstaked,
        withdrawn,
      }
    )
  }, [
    epoches,
    epochids,
    erc20,
    depositEpochRewardfunds,
    actualEpochid,
    stake,
    depositid,
    epochStaked,
    epochUnstaked,
    withdrawn,
  ])

  const rowRenderer = useCallback(({ key, columns, rowData, style, onRowClick, className }) => (
    <EpochesTableRow
      key={key}
      columns={columns}
      rowData={rowData}
      style={style}
      className={className}
      onClick={onRowClick}
    />
  ), [])

  const handleRowClick = useCallback(({ rowData }) => {
    openModal(rowData)
  }, [openModal])

  const handleRowsRendered = useCallback(({ overscanStartIndex, overscanStopIndex }) => {
    setRenderedEpochids(epochids.slice(overscanStartIndex, overscanStopIndex + 1))
  }, [epochids])

  return (
    <>
      <Table
        className={css.table}
        headerColumnClassName={css.headerColumn}
        isLoading={isInitialLoading}
        columns={columns}
        rowCount={isInitialLoading ? 0 : epochids.length}
        rowGetter={rowGetter}
        rowRenderer={rowRenderer}
        onRowClick={handleRowClick}
        onRowsRendered={handleRowsRendered}
      />
      {modal}
    </>
  )
}

EpochesTable.propTypes = {
  depositid: PropTypes.string.isRequired,
}

export default connect(
  (state, { depositid }) => {
    const erc20 = getPageDataERC20(state)
    const deposit = getDeposit(state, depositid)
    const epoches = getEpoches(state)
    const actualEpochid = getActualEpochId(state)
    const account = getActiveAccountAddress(state)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)

    return {
      erc20,
      deposit,
      epoches,
      account,
      actualEpochid,
      is_bc_blockNumberExist,
      isInitialLoading: isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT, [depositid]),
    }
  },
  ({ query }) => [
    query(GET_BLOCKCHAIN_EPOCH),
    query(GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT),
  ]
)(EpochesTable)