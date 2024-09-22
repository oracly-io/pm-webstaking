import { get } from '@oracly/pm-libs/immutable'

export function getDeposits(state) {
  return get(state, ['deposits', 'collection'])
}

export function getDeposit(state, depositid) {
  const deposits = getDeposits(state)

  return get(deposits, [depositid])
}

export function getDepositsTotalSizeByAddress(state, stakerid) {
  return Number(get(state, ['deposits', 'collection_by_address_size', stakerid])) || 0
}

export function getLastDepositidByAddress(state, stakerid) {
  return get(state, ['deposits', 'last_by_address', stakerid])
}

export function getLastDepositByAddress(state, stakerid) {
  const lastDepositid = getLastDepositidByAddress(state, stakerid)
  const deposit = getDeposit(state, lastDepositid)

  return deposit
}
