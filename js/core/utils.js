// 工具函数
// 浏览器端 localStorage 封装 (兼容隐私模式)
export const STORAGE_KEY = 'kidstudy_v1'

export function getStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    if (v === null || v === undefined) return fallback
    return JSON.parse(v)
  } catch (e) {
    console.warn('getStorage failed:', e)
    return fallback
  }
}

export function setStorage(key, val) {
  try {
    if (val === null || val === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(val))
    }
    return true
  } catch (e) {
    console.warn('setStorage failed (隐私模式?):', e)
    return false
  }
}

export function delStorage(key) {
  try { localStorage.removeItem(key) } catch (e) {}
}

// 今天日期 (YYYY-MM-DD)
export function today() {
  return new Date().toISOString().slice(0, 10)
}

// 两个日期相差天数
export function daysBetween(a, b) {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime())
  return Math.floor(ms / 86400000)
}

// 浅克隆
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// 数组乱序 (Fisher-Yates)
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 数组随机取 n 个
export function sample(arr, n) {
  return shuffle(arr).slice(0, n)
}

// 防抖
export function debounce(fn, delay) {
  let t
  return function(...args) {
    clearTimeout(t)
    t = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 朗读 (TTS fallback, 真人录音优先)
export function speak(text, opts = {}) {
  if (window.speechSynthesis) {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = opts.rate || 0.7
    u.pitch = opts.pitch || 1
    u.volume = opts.volume || 1
    window.speechSynthesis.speak(u)
  }
}

// 播放音频
export function playAudio(url) {
  if (!url) return
  const a = new Audio(url)
  return a.play().catch(e => console.warn('audio play failed:', e))
}
