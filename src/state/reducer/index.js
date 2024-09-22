import { rootReducer, combine } from '@lib/reducer-utils'

import auth from './auth'
import application from './application'
import asyncStatus from './asyncStatus'
import pageData from './pageData'
import table from './table'
import statistics from './statistics'
import epoches from './epoches'
import deposits from './deposits'
import stakers from './stakers'
import blockchain from './blockchain'
import users from './users'
import chats from './chats'
import staking from './staking'
import ui from './ui'

const rootCombination = combine({
  auth,
  application,
  asyncStatus,
  pageData,
  table,
  statistics,
  epoches,
  deposits,
  stakers,
  staking,
  chats,
  blockchain,
  users,
  ui,
})

export default rootReducer(rootCombination)
