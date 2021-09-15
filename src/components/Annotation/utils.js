export function getTxtWidth(text, fontSize) {
  fontSize = parseInt(fontSize)
  const smallEnglishRegx = /^[a-z]+$/ // 小写
  const bigEnglishRegx = /^[A-Z]+$/ // 大写
  const numberRegx = /^[0-9]$/ // 数字
  const chinaRegx = /[\u4E00-\u9FA5\uF900-\uFA2D]/ // 中文
  const halfRegx = /[`~@#$%^&*_+<>?{}/;']/
  const quarRegx = /[\\\/:,.!"“”\[\]\(\)\-]/

  let unitWidth

  if (chinaRegx.test(text)) {
    unitWidth = fontSize
  } else if (/\s/.test(text)) {
    unitWidth = fontSize / 4
  } else if (smallEnglishRegx.test(text)) {
    unitWidth = fontSize / 2
  } else if (bigEnglishRegx.test(text)) {
    unitWidth = fontSize / 2
  } else if (halfRegx.test(text)) {
    unitWidth = fontSize / 2
  } else if (numberRegx.test(text)) {
    unitWidth = fontSize / 1.8
  } else if (quarRegx.test(text)) {
    unitWidth = fontSize / 4
  } else {
    unitWidth = fontSize
  }
  return unitWidth
}

export function getRealWith(content, font) {
  if (!content) {
    return 0
  }
  const dom = document.createElement('span')
  dom.style.display = 'inline-block'
  dom.style.visibility = 'hidden'
  dom.style.fontSize = `${font || 16}px`
  // 添加一个中文字符避免开始字符如果是 \r\n 不显示空格导致计算偏差
  dom.textContent = `中${content}`
  document.body.appendChild(dom)
  const width = dom.clientWidth - font
  document.body.removeChild(dom)
  return width
}

const getNewEndIndex = (startIndex, endIndex, enList) => {
  let newEndIndex = endIndex
  const remainList = []
  enList.forEach(item => {
    if (item.endIndex > endIndex && item.startIndex > startIndex) {
      // 获取换行的实体
      if (item.startIndex < newEndIndex) {
        newEndIndex = item.startIndex
      }
    } else {
      remainList.push(item)
    }
  })

  if (newEndIndex == endIndex) {
    return { remainList, newEndIndex }
  }
  return getNewEndIndex(startIndex, newEndIndex, remainList)
}

// 获取每一行的文本和实体
export function getSpan({ endIndex, fontSize, rowMaxWidth, content, list }) {
  const labelFontSize = fontSize - 2
  const remain = content.substr(endIndex)
  let span = ''
  let i = 0
  let totalWith = 0
  // 获取没有实体时本行所显示的文字
  while (i < remain.length && totalWith < rowMaxWidth) {
    let txtWidth = getTxtWidth(remain[i], fontSize)
    if (i != 0) {
      if (remain[i - 1] == remain[i] && /\s/.test(remain[i])) {
        txtWidth = 0
      }
    }

    if (totalWith + txtWidth <= rowMaxWidth) {
      totalWith += txtWidth
      span += remain[i]
      i++
    } else {
      totalWith = rowMaxWidth
    }
  }
  const startIndex = endIndex
  const tempEndIndex = startIndex + span.length
  // 当前行的实体
  const enList = list.filter(item => {
    return item.startIndex >= startIndex && item.startIndex <= tempEndIndex
  })

  const { remainList, newEndIndex } = getNewEndIndex(startIndex, tempEndIndex, enList)

  const newSpan = span.substring(0, newEndIndex - startIndex)

  const labelList = []
  let entRow = 0
  remainList.forEach(item => {
    const leftContent = remain.substring(0, item.startIndex - startIndex)
    // 选中文字左边界 左边间隔一个字符宽度 防止顶部标签出左边界限
    item.leftX = getRealWith(leftContent, fontSize) + fontSize
    // 选中文字宽度
    item.width = getRealWith(content.substring(item.startIndex, item.endIndex), fontSize)
    item.rigthX = item.leftX + item.width
    item.labelWith = labelFontSize * item.labelText?.length + 4
    item.labelLeftX = item.leftX + (item.width - item.labelWith) / 2
    item.labelRightX = item.labelLeftX + item.labelWith
    item.minX = Math.min(item.leftX, item.labelLeftX)
    item.maxX = Math.max(item.rigthX, item.labelRightX)
    item.floor = 1
    let flag = true
    while (flag) {
      if (
        labelList.some(
          label => label.minX < item.maxX && label.maxX > item.minX && label.floor == item.floor
        )
      ) {
        item.floor++
      } else {
        flag = false
      }
    }
    entRow = Math.max(entRow, item.floor)
    labelList.push(item)
  })
  return { span: newSpan, enList: remainList, entRow }
}
