import { UrlQuery, UrlQuerySpec } from '@/types'
import router from '@/router'

const specToQuery = (query: UrlQuerySpec): UrlQuery => {
  const q: UrlQuery = { img: query.img }
  if (query.cats !== undefined) {
    q.cats = JSON.stringify(query.cats)
  }
  if (query.pts !== undefined) {
    q.pts = JSON.stringify(query.pts)
  }
  return q
}

export const goTo = (spec: UrlQuerySpec) => {
  router.push({ query: specToQuery(spec) })
}
