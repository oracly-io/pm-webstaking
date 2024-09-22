import { get } from '@oracly/pm-libs/immutable'

export function getEpoches(state) {
  return get(state, ['epoches' ,'collection'])
}

export function getActualEpochId(state) {
  return get(state, ['epoches' ,'actual'])
}

export function getActualEpoch(state) {
  const actualEpochId = getActualEpochId(state)
  const epoches = getEpoches(state)

  return get(epoches, [actualEpochId])
}