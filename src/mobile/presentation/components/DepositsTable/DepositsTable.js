import PropTypes from 'prop-types'
import React, { useCallback, useRef } from 'react'
import { isEmpty, isEqual, size } from 'lodash'
import { useStore } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { gt } from '@oracly/pm-libs/calc-utils'

import { GET_BLOCKCHAIN_TABLE_DEPOSITS } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { LT } from '@constants'
import Table, { tableConfig } from '@components/common/Table'
import { useScheduledQuery, useInfiniteScroll } from '@hooks'
import { connect } from '@state'
import { getTableDeposits, getDeposits } from '@state/getters'
import { getPageDataERC20, getTableDepositsFilter } from '@state/getters'
import { getLatestbcBlockNumber, isNeverPerformed } from '@state/getters'
import { getDepositsTotalSizeByAddress } from '@state/getters'
import { isInitialLoading, isScrollLoading } from '@state/getters'
import { getActualEpochId, isLoading } from '@state/getters'
import { createDepositsTableFilter } from '@utils'

import { deposit2TableData, columns } from './DepositsTable.utils'

import css from './DepositsTable.module.scss'

const DepositsTable = (props) => {
  const {
    erc20,
    deposits,
    depositids,
    stakerid,
    actualEpochid,
    is_bc_blockNumberExist,
    isInitialLoading,
    isScrollLoading,
  } = props

  const navigate = useNavigate()
  const store = useStore()
  const renderedRowsRef = useRef({})

  const getRenderedDepositids = useCallback((tableDepositids) => {
    if (isEmpty(renderedRowsRef.current)) return []
    const { start, end } = renderedRowsRef.current
    const renderedDepositids = tableDepositids.slice(start, end + 1)
    return renderedDepositids
  }, [])

  useInfiniteScroll(() => {
    const state = store.getState()
    const blockNumber = getLatestbcBlockNumber(state)
    const inProgress = isLoading(state, GET_BLOCKCHAIN_TABLE_DEPOSITS)

    if (stakerid && blockNumber && !inProgress) {
      const tableDepositids = getTableDeposits(state)
      const depositsFilter = createDepositsTableFilter(stakerid)
      const offset = size(tableDepositids)
      if (offset) {
        props.GET_BLOCKCHAIN_TABLE_DEPOSITS({ ...depositsFilter, loadType: LT.SCROLL, offset })
      }
    }
  }, [stakerid])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    const renderedDepositids = getRenderedDepositids(depositids)
    const newDepositids = renderedDepositids.filter((depositid) =>
      isNeverPerformed(state, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, [depositid, erc20, LT.INITIAL])
    )
    if (!isEmpty(newDepositids)) {
      const blockNumber = getLatestbcBlockNumber(state)

      for (const depositid of newDepositids) {
        query(GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, { depositid, erc20, loadType: LT.INITIAL, txn: { blockNumber } }, { schedule: 1 })
      }
    }
  }, [depositids, erc20, is_bc_blockNumberExist])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    const tableDepositids = getTableDeposits(state)
    const blockNumber = getLatestbcBlockNumber(state)
    const inProgress = isLoading(state, GET_BLOCKCHAIN_TABLE_DEPOSITS)
    const prevDepositsFilter = getTableDepositsFilter(state)
    const depositsFilter = createDepositsTableFilter(stakerid)
    const isFilterChanged = !isEqual(prevDepositsFilter, depositsFilter)

    // Load more deposits to fill full page
    const viewableTableSize = Math.ceil(document.documentElement.clientHeight / tableConfig.rowHeight)
    const tableSize = size(tableDepositids)
    if (stakerid && !inProgress && viewableTableSize > tableSize) {
      const totalSize = getDepositsTotalSizeByAddress(state, stakerid)

      if (tableSize && gt(totalSize, tableSize) && !isFilterChanged) {
        query(
          GET_BLOCKCHAIN_TABLE_DEPOSITS,
          { ...depositsFilter, loadType: LT.FILL_PAGE, offset: tableSize, txn: { blockNumber } },
          { schedule: 1 }
        )
      }
    }

    // Load new deposits
    if (stakerid && !inProgress) {
      const loadType = isFilterChanged ? LT.INITIAL : LT.LOAD_NEW

      query(GET_BLOCKCHAIN_TABLE_DEPOSITS, { ...depositsFilter, loadType, txn: { blockNumber } }, { schedule: 5 })
    }
  }, [stakerid, erc20, is_bc_blockNumberExist])

  const handleRowsRendered = useCallback(({ overscanStartIndex, overscanStopIndex }) => {
    renderedRowsRef.current = { start: overscanStartIndex, end: overscanStopIndex }
  }, [])

  const handleRowClick = useCallback(({ rowData }) => {
    navigate(rowData.depositid)
  }, [navigate])

  const rowGetter = useCallback(({ index }) =>
    deposit2TableData(deposits[depositids[index]], { actualEpochid, erc20 }),
    [depositids, deposits, actualEpochid, erc20]
  )

  return (
    <Table
      className={css.table}
      isLoading={isInitialLoading || isScrollLoading}
      columns={columns}
      rowCount={isInitialLoading ? 0 : depositids.length}
      rowGetter={rowGetter}
      onRowClick={handleRowClick}
      onRowsRendered={handleRowsRendered}
    />
  )
}

DepositsTable.propTypes = {
  stakerid: PropTypes.string.isRequired,
}

export default connect(
  (state) => {
    const erc20 = getPageDataERC20(state)
    const deposits = getDeposits(state)
    const depositids = getTableDeposits(state)
    const actualEpochid = getActualEpochId(state)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)

    return {
      erc20,
      depositids,
      deposits,
      actualEpochid,
      is_bc_blockNumberExist,
      isInitialLoading: isInitialLoading(state, GET_BLOCKCHAIN_TABLE_DEPOSITS),
      isScrollLoading: isScrollLoading(state, GET_BLOCKCHAIN_TABLE_DEPOSITS),
    }
  },
  ({ query }) => [
    query(GET_BLOCKCHAIN_TABLE_DEPOSITS),
  ]
)(DepositsTable)