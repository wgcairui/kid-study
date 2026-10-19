// Smoke test: 验证 core 模块基本功能
import { makeProfile, makeState, addProfile, switchProfile, deleteProfile, getActiveProfile } from '../js/core/profile.js'
import { markLessonDone, getLessonProgress, progressOf, addStar, updateStreak, addTodayMinutes } from '../js/core/progress.js'
import { addWrong, topWrongs, wrongStats, removeWrong } from '../js/core/wrongbook.js'
import { nextReviewTs, onAnswered, getDueItems, isDue } from '../js/core/ebbinghaus.js'
import { getStorage, setStorage, today, daysBetween, shuffle, sample } from '../js/core/utils.js'

let pass = 0, fail = 0
function t(name, fn) {
  try { fn(); console.log('  ✅', name); pass++ }
  catch (e) { console.log('  ❌', name, '-', e.message); fail++ }
}

console.log('\n=== profile ===')
t('makeProfile', () => {
  const p = makeProfile('test', '🐶')
  if (!p.name || p.avatar !== '🐶') throw new Error('name/avatar')
  if (!p.lockByLesson || !p.stats) throw new Error('fields')
})
t('makeState', () => {
  const s = makeState()
  if (!s.profiles.child1) throw new Error('no default profile')
  if (s.activeProfile !== 'child1') throw new Error('active not child1')
})
t('add/switch/delete profile', () => {
  const s = makeState()
  const id = addProfile(s, '二宝', '🐱')
  if (!s.profiles[id]) throw new Error('add failed')
  switchProfile(s, id)
  if (s.activeProfile !== id) throw new Error('switch failed')
  deleteProfile(s, id)
  if (s.profiles[id]) throw new Error('delete failed')
})

console.log('\n=== progress ===')
t('markLessonDone', () => {
  const p = makeProfile('t')
  markLessonDone(p, 'l1', 5)
  if (!p.lockByLesson.l1.done) throw new Error('not done')
  if (p.lockByLesson.l1.score !== 5) throw new Error('score')
})
t('progressOf', () => {
  const p = makeProfile('t')
  markLessonDone(p, 'l1', 5)
  markLessonDone(p, 'l2', 4)
  if (progressOf(p, ['l1', 'l2', 'l3']) !== 2/3) throw new Error('ratio')
})
t('addStar + updateStreak', () => {
  const p = makeProfile('t')
  addStar(p, 3)
  addStar(p, 2)
  if (p.stats.stars !== 5) throw new Error('stars')
  updateStreak(p)
  if (p.stats.streak !== 1) throw new Error('streak first day')
  // 第二天再打卡
  p.stats.lastStudy = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  updateStreak(p)
  if (p.stats.streak !== 2) throw new Error('streak second day')
})
t('addTodayMinutes', () => {
  const p = makeProfile('t')
  addTodayMinutes(p, 10)
  addTodayMinutes(p, 5)
  if (p.stats.todayMinutes !== 15) throw new Error('today')
  if (p.stats.totalMinutes !== 15) throw new Error('total')
})

console.log('\n=== wrongbook ===')
t('addWrong', () => {
  const book = []
  addWrong(book, '耳', 'l2', 'listen')
  addWrong(book, '耳', 'l2', 'listen')
  addWrong(book, '手', 'l3', 'stroke')
  if (book.length !== 2) throw new Error('dedupe')
  if (book[0].count !== 2) throw new Error('count')
})
t('topWrongs', () => {
  const book = []
  addWrong(book, '耳', 'l2', 'listen')
  addWrong(book, '耳', 'l2', 'listen')
  addWrong(book, '手', 'l3', 'stroke')
  const top = topWrongs(book, 5)
  if (top[0].w !== '耳') throw new Error('order')
})
t('removeWrong', () => {
  const book = []
  addWrong(book, '耳', 'l2', 'listen')
  addWrong(book, '手', 'l3', 'stroke')
  removeWrong(book, '耳', 'l2')
  if (book.length !== 1 || book[0].w !== '手') throw new Error('remove')
})

console.log('\n=== ebbinghaus ===')
t('nextReviewTs interval', () => {
  const now = 1000000000000
  if (nextReviewTs(0, now) !== now + 86400000) throw new Error('level 0 not 1 day')
  if (nextReviewTs(2, now) !== now + 4 * 86400000) throw new Error('level 2 not 4 day')
})
t('onAnswered correct', () => {
  const item = { w: '耳', level: 0, nextReview: 0 }
  const r = onAnswered(item, true)
  if (r.level !== 1) throw new Error('level')
  if (r.correctCount !== 1) throw new Error('count')
})
t('onAnswered wrong', () => {
  const item = { w: '耳', level: 3, nextReview: 9999999999999 }
  const r = onAnswered(item, false)
  if (r.level !== 0) throw new Error('reset')
  if (r.wrongCount !== 1) throw new Error('count')
})
t('getDueItems', () => {
  const items = [
    { w: 'A', nextReview: Date.now() - 1000 },  // due
    { w: 'B', nextReview: Date.now() + 100000 },  // not due
  ]
  const due = getDueItems(items)
  if (due.length !== 1 || due[0].w !== 'A') throw new Error('filter')
})

console.log('\n=== utils ===')
t('today format', () => {
  const t1 = today()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t1)) throw new Error('format')
})
t('daysBetween', () => {
  const d = daysBetween('2026-10-19', '2026-10-22')
  if (d !== 3) throw new Error('diff')
})
t('shuffle/sample', () => {
  const a = [1, 2, 3, 4, 5]
  const s = shuffle(a)
  if (s.length !== 5) throw new Error('length')
  const s2 = sample([1, 2, 3, 4, 5], 3)
  if (s2.length !== 3) throw new Error('sample length')
})

console.log(`\n=== ${pass} pass / ${fail} fail ===\n`)
process.exit(fail > 0 ? 1 : 0)
