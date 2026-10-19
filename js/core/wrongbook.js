// 错题本
// 每条: { w, lessonId, type, ts, count }
import { today } from './utils.js'

export function addWrong(book, w, lessonId, type) {
  const existing = book.find(x => x.w === w && x.lessonId === lessonId)
  if (existing) {
    existing.count = (existing.count || 1) + 1
    existing.ts = Date.now()
  } else {
    book.push({ w, lessonId, type, ts: Date.now(), count: 1 })
  }
  return book
}

export function removeWrong(book, w, lessonId) {
  const i = book.findIndex(x => x.w === w && x.lessonId === lessonId)
  if (i !== -1) book.splice(i, 1)
  return book
}

export function topWrongs(book, n = 10) {
  return book.slice().sort((a, b) => (b.count || 1) - (a.count || 1)).slice(0, n)
}

// 家长后台统计
export function wrongStats(book) {
  const todayStr = today()
  const todayCount = book.filter(x => {
    const d = new Date(x.ts).toISOString().slice(0, 10)
    return d === todayStr
  }).length
  return {
    total: book.length,
    today: todayCount,
    top: topWrongs(book, 10),
  }
}
