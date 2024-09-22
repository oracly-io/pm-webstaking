import { get } from '@oracly/pm-libs/immutable'

function getTable(state) {
  const table = get(state, 'table')

  return table
}

export function getTableDeposits(state) {
  const table = getTable(state)

  return get(table, ['deposits', 'data'])
}

export function getTableDepositsFilter(state) {
  const table = getTable(state)

  return get(table, ['deposits', 'filter'])
}

export function getTableEpoches(state) {
  const table = getTable(state)

  return get(table, ['epoches', 'data'])
}

export function getTableEpochesFilter(state) {
  const table = getTable(state)

  return get(table, ['epoches', 'filter'])
}