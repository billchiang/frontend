import { fetchJSON, removePrefix } from './utils'

export default async function search (url, query) {
  url = removePrefix(url)
  query = encodeURIComponent(query)

  const res = await fetchJSON(`/api/search${url}?query=${query}`, {})
  let data = res
  data.url = `/files${data.path}`
    if (data.isDir) {
      if (!data.url.endsWith('/')) data.url += '/'
      data.items = data.items.map((item, index) => {
        item.index = index
        item.url = `${data.url}${encodeURIComponent(item.name)}`
        if (item.isDir) {
          item.url += '/'
        }
        return item
      })
    }
    return data
}
