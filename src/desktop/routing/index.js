import React from 'react'
import { isAddress, isHexString } from 'ethers'

import NotFound from '@pages/notfound'
import Master from '@pages/master'
import DepositsPage from '@pages/DepositsPage'
import DepositPage, { DepositPageCrumb } from '@pages/DepositPage'

export default [
  {
    path: '/',
    element: <Master />,
    children: [
			{
				path: ':stakerid',
				element: <DepositsPage />,
        handle: {
          validator: ({ params: { stakerid } }) => isAddress(stakerid)
        },
			},
      {
        path: ':stakerid/:depositid',
        element: <DepositPage />,
        handle: {
          crumb: ({ params: { depositid } }) => <DepositPageCrumb depositid={depositid} />,
          validator: ({ params: { stakerid, depositid } }) =>
            isAddress(stakerid) && isHexString(depositid),
        },
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  },
]
