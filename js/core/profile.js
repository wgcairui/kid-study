// 多娃档案
import { getStorage, setStorage, today } from './utils.js'

export function makeProfile(name, avatar = '🐰') {
  return {
    name,
    avatar,
    createdAt: Date.now(),
    lockByLesson: {},      // { lessonId: { done, score, ts } }
    wrongBook: [],
    reviewQueue: [],
    stats: {
      stars: 0,
      streak: 0,
      lastStudy: null,
      todayMinutes: 0,
      totalMinutes: 0,
      medals: [],
    },
  }
}

export function makeState() {
  return {
    version: 1,
    activeProfile: 'child1',
    profiles: {
      child1: makeProfile('小宝', '🐰'),
    },
    settings: {
      eyeMode: false,
      bgMusic: true,
      forceRest: true,
      restIntervalMin: 20,
      restDurationSec: 20,
    },
  }
}

export function loadState() {
  return getStorage('kidstudy_v1', null) || makeState()
}

export function saveState(state) {
  return setStorage('kidstudy_v1', state)
}

export function getActiveProfile(state) {
  return state.profiles[state.activeProfile]
}

export function addProfile(state, name, avatar) {
  const id = 'child' + (Object.keys(state.profiles).length + 1)
  state.profiles[id] = makeProfile(name, avatar)
  return id
}

export function switchProfile(state, id) {
  if (state.profiles[id]) {
    state.activeProfile = id
  }
  return state
}

export function deleteProfile(state, id) {
  if (Object.keys(state.profiles).length <= 1) return state  // 至少留 1 个
  delete state.profiles[id]
  if (state.activeProfile === id) {
    state.activeProfile = Object.keys(state.profiles)[0]
  }
  return state
}
