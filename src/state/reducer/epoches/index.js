import { isEmpty } from 'lodash'
import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { set } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import { GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, GET_BLOCKCHAIN_EPOCH } from '@actions'

import { blockchain2Epoch, blockchain2EpochMap } from '@state/mappers'
import { blockchainEpoch2EpochRewardfundMap} from '@state/mappers'
import { updateEntitiesFactory } from '@state/reducer/utils'

const updateBlockchainEpoches = updateEntitiesFactory(blockchain2Epoch)

export default {

  [success(GET_BLOCKCHAIN_ACTUAL_EPOCH_ID)]: (state, { result: epochid }) => {

    if (!isEmpty(epochid)) {
      state = set(state, ['actual'], epochid)
    }

    return state
  },

  [success(GET_BLOCKCHAIN_EPOCH)]: (state, { erc20, result: bcepoch }) => {

    if (!isEmpty(bcepoch)) {
      const bcepochMap = blockchain2EpochMap(bcepoch)
      state = updateBlockchainEpoches(state, [bcepochMap])
      const bcepochRewardfundMap = blockchainEpoch2EpochRewardfundMap(bcepoch)
      const updateBlockchainEpochRewardfunds = updateEntitiesFactory(
        (rewardfund) => ({
          collected: rewardfund.collected && toDecimalERC20(rewardfund.collected, erc20)
        }),
        () => [bcepochMap.epochid, 'rewardfunds', erc20],
      )
      state = updateBlockchainEpochRewardfunds(state, [bcepochRewardfundMap])
    }

    return state
  },

}
