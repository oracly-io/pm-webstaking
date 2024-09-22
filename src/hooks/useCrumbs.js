import { useMatches } from 'react-router-dom'

const useCrumbs = () => {
  const matches = useMatches()

  return matches
    .filter((match) => match?.handle?.crumb)
    .map((match) => match.handle.crumb)
}

export default useCrumbs