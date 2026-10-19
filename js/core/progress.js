// 进度管理: 按 lesson 记录完成情况
import { today } from './utils.js'

// 标记单课完成 (score: 0-5, 5 = 全对)
export function markLessonDone(profile, lessonId, score = 5) {
  profile.lockByLesson[lessonId] = {
    done: true,
    score,
    ts: Date.now(),
  }
  profile.stats.lastStudy = today()
  return profile
}

// 撤销
export function markLessonUndone(profile, lessonId) {
  delete profile.lockByLesson[lessonId]
  return profile
}

// 获取某课进度
export function getLessonProgress(profile, lessonId) {
  return profile.lockByLesson[lessonId] || { done: false }
}

// 一组课里已完成数
export function completedIn(profile, lessonIds) {
  return lessonIds.filter(id => profile.lockByLesson[id]?.done).length
}

// 进度百分比 (0-1)
export function progressOf(profile, lessonIds) {
  if (!lessonIds.length) return 0
  return completedIn(profile, lessonIds) / lessonIds.length
}

// 加星
export function addStar(profile, n = 1) {
  profile.stats.stars = (profile.stats.stars || 0) + n
  return profile
}

// 更新今日学习分钟
export function addTodayMinutes(profile, min) {
  profile.stats.todayMinutes = (profile.stats.todayMinutes || 0) + min
  profile.stats.totalMinutes = (profile.stats.totalMinutes || 0) + min
  profile.stats.lastStudy = today()
  return profile
}

// 连续打卡
export function updateStreak(profile) {
  const last = profile.stats.lastStudy
  const t = today()
  if (last === t) return profile  // 今日已打卡
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (last === yesterday) {
    profile.stats.streak = (profile.stats.streak || 0) + 1
  } else {
    profile.stats.streak = 1
  }
  profile.stats.lastStudy = t
  return profile
}
