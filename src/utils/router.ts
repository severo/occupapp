import { UrlQuery, UrlQuerySpec } from '@/utils/types.ts'
import router from '@/router'
import {} from 'vue-router'

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
