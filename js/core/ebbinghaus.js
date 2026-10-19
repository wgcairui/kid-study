// 艾宾浩斯遗忘曲线复习算法
// level 0: 1 天后复习
// level 1: 2 天后复习
// level 2: 4 天后复习
// level 3: 7 天后复习
// level 4: 15 天后复习
// 答对 → level++, 答错 → level 归 0

const INTERVALS_DAYS = [1, 2, 4, 7, 15]

export function nextReviewTs(level, fromTs = Date.now()) {
  const days = INTERVALS_DAYS[Math.min(level, INTERVALS_DAYS.length - 1)]
  return fromTs + days * 86400000
}

export function onAnswered(item, correct) {
  if (correct) {
    const newLevel = (item.level || 0) + 1
    return {
      ...item,
      level: newLevel,
      nextReview: nextReviewTs(newLevel),
      lastCorrect: Date.now(),
      correctCount: (item.correctCount || 0) + 1,
    }
  } else {
    return {
      ...item,
      level: 0,
      nextReview: nextReviewTs(0),
      lastWrong: Date.now(),
      wrongCount: (item.wrongCount || 0) + 1,
    }
  }
}

export function isDue(item, now = Date.now()) {
  return item.nextReview <= now
}

export function getDueItems(items, now = Date.now()) {
  return items.filter(x => isDue(x, now))
}
