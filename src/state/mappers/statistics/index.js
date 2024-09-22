import { curryRight } from 'lodash'

import { blockchain2EntityMap } from '@utils'

export const MENTOR_BC = {
  'id'          : '0',
  'mentorid'    : '0',
  'circle'      : '1',
  'createdAt'   : '4',
  'updatedAt'   : '5',
}
export const blockchain2MentorMap = curryRight(blockchain2EntityMap)(MENTOR_BC)

export const MENTOR_FUND_BC = {
  'earned'     : '2',
  'claimed'    : '3',
}
export const blockchain2MentorFundMap = curryRight(blockchain2EntityMap)(MENTOR_FUND_BC)

export const PREDICTION_BC = {
  'predictionid' : '0',
  'roundid'      : '1',
  'gameid'       : '2',
  'bettor'       : '3',
  'position'     : '4',
  'wager'        : '5',
  'claimed'      : '6',
  'createdAt'    : '7',
  'payout'       : '8',
  'commission'   : '9',
  'erc20'        : '10',
}
export const blockchain2PredictionMap = curryRight(blockchain2EntityMap)(PREDICTION_BC)

export const BETTOR_BC = {
  'id'               : '0',
  'predictionsTotal' : '1.0',
  'depositTotal'     : '2.0',
  'paidoutTotal'     : '3.0',
}
export const blockchain2BettorMap = curryRight(blockchain2EntityMap)(BETTOR_BC)
