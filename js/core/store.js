// 全局状态 (Vue 3 reactive)
// 用例: import { state, save } from '../core/store.js'
import { reactive, computed } from 'vue'
import { loadState, saveState, makeState, getActiveProfile, addProfile as _addProfile, switchProfile as _switchProfile, deleteProfile as _delProfile } from './profile.js'
import { markLessonDone, markLessonUndone, addStar, addTodayMinutes, updateStreak } from './progress.js'
import { addWrong, removeWrong as _removeWrong } from './wrongbook.js'
import { onAnswered, getDueItems } from './ebbinghaus.js'

// 加载或创建
const initial = loadState()
export const state = reactive(initial)

// 自动持久化 (debounce)
let saveTimer = null
function scheduleSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveState(state), 200)
}

// 包装 state 修改, 每次自动保存
function wrap(target, names) {
  names.forEach(name => {
    const orig = target[name]
    if (typeof orig === 'function') {
      target[name] = (...args) => {
        const r = orig.apply(target, args)
        scheduleSave()
        return r
      }
    }
  })
}

// ============ 计算属性 ============
export const activeProfile = computed(() => getActiveProfile(state))
export const dueReviews = computed(() => getDueItems(activeProfile.value.reviewQueue))
export const totalStars = computed(() => activeProfile.value.stats.stars || 0)

// ============ Actions ============
export const actions = {
  // 档案
  addProfile(name, avatar) { _addProfile(state, name, avatar); scheduleSave() },
  switchProfile(id) { _switchProfile(state, id); scheduleSave() },
  deleteProfile(id) { _delProfile(state, id); scheduleSave() },

  // 进度
  markLessonDone(lessonId, score) {
    markLessonDone(activeProfile.value, lessonId, score)
    updateStreak(activeProfile.value)
    scheduleSave()
  },
  markLessonUndone(lessonId) { markLessonUndone(activeProfile.value, lessonId); scheduleSave() },
  addStar(n) { addStar(activeProfile.value, n); scheduleSave() },
  addTodayMinutes(m) { addTodayMinutes(activeProfile.value, m); scheduleSave() },

  // 错题
  addWrong(w, lessonId, type) {
    addWrong(activeProfile.value.wrongBook, w, lessonId, type)
    scheduleSave()
  },
  removeWrong(w, lessonId) {
    _removeWrong(activeProfile.value.wrongBook, w, lessonId)
    scheduleSave()
  },

  // 复习 (艾宾浩斯)
  reviewAnswered(w, correct) {
    const q = activeProfile.value.reviewQueue
    const idx = q.findIndex(x => x.w === w)
    if (idx === -1) return
    q[idx] = onAnswered(q[idx], correct)
    if (correct) {
      // 复习通过, 可选择移出队列
      q.splice(idx, 1)
    }
    scheduleSave()
  },

  // 设置
  setSetting(key, val) { state.settings[key] = val; scheduleSave() },
}

// ============ 初始化 (新建档案时给一些示例进度) ============
export function ensureProfile() {
  if (Object.keys(state.profiles).length === 0) {
    Object.assign(state.profiles, makeState().profiles)
    scheduleSave()
  }
}
ensureProfile()
