import { isEmpty, isEqual } from 'lodash'
import { get, set } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import { GET_BLOCKCHAIN_TABLE_DEPOSITS } from '@actions'
import { LT } from '@constants'
import { blockchain2DepositMap } from '@state/mappers'
import { createDepositsTableFilter } from '@utils'

function updateEntities(state, tableName, entities) {
  const prevEntities = get(state, [tableName, 'data'])
  const nextEntities = entities.map(({ id }) => id)
  if(!isEqual(prevEntities, nextEntities)) {
    state = set(state, [tableName, 'data'], nextEntities)
  }
  return state
}

function addEntities(state, tableName, entities, before) {
  const entityids = entities.map(({ id }) => id)
  if (!isEmpty(entityids)) {
    state = set(state, [tableName, 'data'], (eids) => {
      return before ? entityids.concat(eids) : eids.concat(entityids)
    })
  }
  return state
}

function updateFilter(state, tableName, nextFilter) {
  const prevFilter = get(state, [tableName, 'filter'])

  if(!isEqual(prevFilter, nextFilter)) {
    state = set(state, [tableName, 'filter'], nextFilter)
  }

  return state
}

export default {
  metadata: {
    default: {
      deposits: {
        data: [],
        filter: {},
      },
      epoches: {
        data: [],
        filter: {},
      }
    },
  },

  [GET_BLOCKCHAIN_TABLE_DEPOSITS]: (state, { stakerid }) => {

    const filter = createDepositsTableFilter(stakerid)
    state = updateFilter(state, 'deposits', filter)

    return state
  },
  [success(GET_BLOCKCHAIN_TABLE_DEPOSITS)]: (state, { loadType, result: [bcdeposits] }) => {

    const deposits = bcdeposits
      .map((bcdeposit) => blockchain2DepositMap(bcdeposit))
      .filter(({ id }) => !get(state, ['deposits', 'data'])?.includes(id))

    if (loadType === LT.SCROLL) {
      state = addEntities(state, 'deposits', deposits)
    } else if (loadType === LT.FILL_PAGE) {
      state = addEntities(state, 'deposits', deposits)
    } else if (loadType === LT.LOAD_NEW) {
      state = addEntities(state, 'deposits', deposits, true)
    } else {
      state = updateEntities(state, 'deposits', deposits)
    }

    return state
  },

}
