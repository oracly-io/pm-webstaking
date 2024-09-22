import { isEmpty } from 'lodash'
import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { set } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import { ORCY_ADDRESS } from '@constants'
import { GET_BLOCKCHAIN_BUY_4_STAKEPOOL } from '@state/actions'

export default {

  [success(GET_BLOCKCHAIN_BUY_4_STAKEPOOL)]: (state, { result: stakepool }) => {

    if (!isEmpty(stakepool)) {
      state = set(state, ['stakepool'], toDecimalERC20(stakepool, ORCY_ADDRESS))
    }

    return state
  },

}
