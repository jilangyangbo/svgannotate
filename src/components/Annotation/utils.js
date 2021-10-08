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
  } else if (/\s/.test(text) && '　' != text) {
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

export function getRealWith(content, font, isLeft) {
  if (!content) {
    return 0
  }
  const dom = document.createElement('span')
  dom.style.display = 'inline-block'
  dom.style.visibility = 'hidden'
  dom.style.fontSize = `${font || 16}px`
  // 添加一个中文字符避免开始字符如果是 \r\n 不显示空格导致计算偏差
  dom.textContent = `${isLeft ? '' : '中'}${content}文`
  document.body.appendChild(dom)
  const width = dom.clientWidth - font * (isLeft ? 1 : 2)
  document.body.removeChild(dom)
  return width
}

const getNewEndIndex = (startIndex, endIndex, enList) => {
  let newEndIndex = endIndex
  const remainList = []
  enList.forEach((item) => {
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
      if (
        /\s/.test(remain[i - 1]) &&
        /\s/.test(remain[i]) &&
        '　' != remain[i]
      ) {
        txtWidth = 0
        if (remain[i - 1] == '\r' && remain[i] == '\n' && /\S/.test(span)) {
          totalWith = rowMaxWidth
        }
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
  const enList = list.filter((item) => {
    return item.startIndex >= startIndex && item.startIndex <= tempEndIndex
  })

  const { remainList, newEndIndex } = getNewEndIndex(
    startIndex,
    tempEndIndex,
    enList
  )

  const newSpan = span.substring(0, newEndIndex - startIndex)

  const labelList = []
  let entRow = 0
  remainList.forEach((item) => {
    const leftContent = remain.substring(0, item.startIndex - startIndex)
    // 选中文字左边界 左边间隔一个字符宽度 防止顶部标签出左边界限
    item.leftX = getRealWith(leftContent, fontSize, true) + fontSize
    // 选中文字宽度
    item.width = getRealWith(
      content.substring(item.startIndex, item.endIndex),
      fontSize
    )
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
          (label) =>
            label.minX < item.maxX &&
            label.maxX > item.minX &&
            label.floor == item.floor
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
export function getKeyValue(key, content) {
  if (!content) {
    return ''
  }
  const keyList = [
    '入院情况',
    '入院诊断',
    '住院后的治疗及检查情况',
    '出院诊断',
    '出院情况及医嘱',
    '出院嘱',
    '医师签名',
  ]
  const keyObj = {
    入院情况: ['入院情况'],
    入院诊断: ['入院诊断'],
    出院诊断: ['出院诊断'],
    诊疗过程描述: ['诊疗过程描述', '住院后的治疗及检查情况'],
    出院情况: ['出院情况', '出院情况及医嘱'],
    出院医嘱: ['出院医嘱', '出院嘱'],
  }
  var result = content
  let endIndex = content.length - 1
  if (keyObj[key]) {
    let res = RegExp('(' + keyObj[key].join('|') + ')[:：]').exec(content)
    if (res) {
      result = content.substring(res.index + res[0].length)
    }else {
      return''
    }

    let endRes = RegExp('(' + keyList.join('|') + ')[:：]').exec(result)
    if (endRes) {
      endIndex = endRes.index
    }
    // let hasKey = false
    // for (let i = 0; i < keyObj[key].length; i++) {
    //   let tempIndex = content.indexOf(keyObj[key][i] + '：')
    //   if (tempIndex == -1) {
    //     tempIndex = content.indexOf(keyObj[key][i] + ':')
    //   }
    //   if (tempIndex > -1) {
    //     hasKey = true
    //     tempIndex = tempIndex + keyObj[key][i].length + 1
    //     result = content.substring(tempIndex)
    //     break
    //   }
    // }
    // if (!hasKey) {
    //   return ''
    // }
    // for (let i = 0; i < keyList.length; i++) {
    //   let tempIndex = result.indexOf(keyList[i] + '：')
    //   if (tempIndex == -1) {
    //     tempIndex = result.indexOf(keyList[i] + ':')
    //   }
    //   if (tempIndex > -1 && tempIndex < endIndex) {
    //     endIndex = tempIndex
    //   }
    // }
    result = result.substring(0, endIndex).trim()
  }
  return result
}
