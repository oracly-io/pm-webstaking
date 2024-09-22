import { get } from '@oracly/pm-libs/immutable'

export function getBuy4StakePool(state) {
  return get(state, ['staking', 'stakepool'])
}