/* eslint-disable no-loop-func */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Modal, Radio } from 'antd'
import style from './index.module.scss'
import { getSpan } from './utils'

const SvgContentIndex = ({
  content,
  onSelectEn,
  list,
  onRemoveLabel,
  onDeleteRelation,
  connections,
  onAddRelation,
}) => {
  const [showContent, setShowContent] = useState([])
  const [pathGroup, setPathGroup] = useState([])
  const [relationTextGroup, setRelationTextGroup] = useState([])
  const [relationPathGroup, setRelationPathGroup] = useState([])
  const [hoverRelationId, setHoverRelationId] = useState(null)
  const [selectLabel, setSelectLabel] = useState({})
  const [addRealtionPath, setAddRealtionPath] = useState(null)
  const [addRelationVisible, setAddRelationVisible] = useState(false)
  const [toLabel, setToLabel] = useState({})
  const [optionList, setOptionList] = useState([])
  const svgRef = useRef()
  const childRef = useRef()
  const divRef = useRef()
  const selectLabelRef = useRef(selectLabel)
  useEffect(() => {
    selectLabelRef.current = selectLabel
  }, [selectLabel])

  const hoverRelationIdRef = useRef(hoverRelationId)
  useEffect(() => {
    hoverRelationIdRef.current = hoverRelationId
  }, [hoverRelationId])

  console.log('=useRef==')
  console.log('hoverRelationId===',hoverRelationId);
  const onCancelAddRelation = () => {
    setAddRealtionPath()
    svgRef.current.onmousemove = null
    setSelectLabel({})
    document.body.oncontextmenu = null
    setToLabel({})
    setAddRelationVisible(false)
  }
  const onClickLabel = useCallback((item) => {
    console.log('onClickLabel==item=', item)
    let fromLabel = selectLabelRef.current
    if (fromLabel && fromLabel.id) {
      if (fromLabel.id == item.id) {
        onCancelAddRelation()
      } else {
        setToLabel(item)
        const options = connections.filter(
          (option) =>
            option.fromLabelId == fromLabel.labelId &&
            option.toLabelId == item.labelId
        )
        setOptionList(options)
        setAddRelationVisible(true)
      }
    } else {
      console.log('else==selectLabel=', selectLabelRef.current)
      setSelectLabel(item)
      setAddRealtionPath(null)
      svgRef.current.onmousemove = (e) => {
        let startX = item.labelLeftX
        if (e.offsetX < item.labelLeftX + item.labelWith / 2) {
          startX = item.labelRightX
        }
        const cx1 = startX + (e.offsetX - startX) / 4
        const cx2 = e.offsetX - (e.offsetX - startX) / 4
        const cy = Math.min(item.topY, e.offsetY) - 20
        const path = (
          <path
            d={`M${startX} ${item.topY}  C${cx1},${cy} ${cx2},${cy}  ${e.offsetX}, ${e.offsetY} `}
            stroke="black"
            fill="none"
            strokeWidth="1"
            style={{ markerEnd: ` url('#markerArrow')` }}
          />
        )
        setAddRealtionPath(path)
      }
      document.body.oncontextmenu = (e) => {
        e.preventDefault()
        onCancelAddRelation()
      }
    }
  }, [])
  const onSelectRelation = (e) => {
    const relation = e.target.value
    const data = {
      fromEntity: selectLabel.id,
      toEntity: toLabel.id,
      connectionId: relation.id,
      relationText: relation.text,
    }
    onAddRelation(data)
    onCancelAddRelation()
  }
  const genLabel = (item, fontSize, totalEntRow, entRow, rowNum) => {
    const labelFontSize = fontSize - 2 // 标签字体
    const labelHeight = labelFontSize + 12 // 标签高度(文字加大括号)
    const lineHeight = fontSize * 1.5 // 行高
    const rectHeight = fontSize * 1.2 // 文字背景框高度
    // 标签绝对Y坐标(背景框的Y坐标)
    // 注:fontSize * 0.5 为 文字的行间距;理论上应该为0.4,但是测试发现text 默认下移0.1*fontsize
    const RectY =
      rowNum * lineHeight +
      (totalEntRow + entRow) * labelHeight +
      fontSize * 0.5
    const labelMaxY = labelHeight * (item.floor - 1) * -1 // 标签相对底部Y坐标

    const labelTopY = RectY - labelHeight * item.floor
    item.topY = labelTopY
    const labelPath = (
      <g
        key={item.id}
        style={{
          transform: `translate(${item.leftX}px, ${RectY}px)`,
        }}
      >
        <rect
          rx="3"
          height={rectHeight}
          width={item.width}
          style={{ fill: item.labelColor }}
        />
        <g
          style={{
            transform: `translate(${
              (item.width - item.labelText?.length * labelFontSize - 4) / 2
            }px,${-labelHeight * item.floor}px)`,
          }}
        >
          <rect
            fill={`${item.labelColor}E0`}
            stroke="#436db2"
            width={item.labelWith}
            height={fontSize}
            rx="4"
          />
          <text
            dx="2"
            dy={`${labelFontSize}px`}
            style={{
              fontSize: `${labelFontSize}px`,
              userSelect: 'none',
              cursor: 'pointer',
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              onRemoveLabel(item.id)
            }}
            onClick={() => {
              onClickLabel(item)
            }}
          >
            {item.labelText}
          </text>
        </g>
        <path
          d={`M0 ${labelMaxY}  Q-3 ${labelMaxY - 4} ${item.width / 4} ${
            labelMaxY - 3
          } T${item.width / 2} ${labelMaxY - 6} M${
            item.width
          } ${labelMaxY}   Q${item.width + 3} ${labelMaxY - 4} ${
            (item.width / 4) * 3
          } ${labelMaxY - 3} T${item.width / 2} ${labelMaxY - 6}`}
          stroke="green"
          fill="none"
          strokeWidth="1"
        />
      </g>
    )

    return { labelTopY, labelPath }
  }

  const render = () => {
    console.log('==render=')
    const newContent = []
    const fontSizeStr = window.getComputedStyle(svgRef.current).fontSize
    const fontSize = parseInt(fontSizeStr.substr(0, fontSizeStr.length - 2), 10)
    const rowMaxWidth =
      divRef.current.getBoundingClientRect().width - fontSize * 2
    const lineHeight = fontSize * 1.5
    const labelFontSize = fontSize - 2 // 标签字体
    const labelHeight = labelFontSize + 12 // 标签高度(文字加大括号)
    const relationFontSize = fontSize - 4

    let endIndex = 0
    let rowNum = 0
    const rowContentList = []
    let allEnlist = []
    const tmpList = list.map((o) => ({ ...o }))
    while (endIndex < content.length && rowNum < content.length) {
      const { span, enList, entRow } = getSpan({
        endIndex,
        fontSize,
        rowMaxWidth,
        content,
        list: tmpList,
      })
      rowContentList.push({ span, enList, entRow, rowNum })

      allEnlist = allEnlist.concat(enList)
      endIndex += span.length
      rowNum++
    }
    // 计算所有的关系图
    const allRelationList = []
    rowContentList.forEach((row) => {
      const rowRelationList = []
      if (row.enList && row.enList.length > 0) {
        row.enList.forEach((item) => {
          if (item.relationList && item.relationList.length > 0) {
            item.relationList.forEach((relation) => {
              // 已经计算过的不在计算
              if (allRelationList.some((re) => re.id == relation.id)) {
                return
              }
              let matchEn = {}
              if (relation.fromEntity == item.id) {
                matchEn = allEnlist.filter(
                  (en) => en.id == relation.toEntity
                )[0]
                if (matchEn.labelLeftX < item.labelLeftX) {
                  relation.leftX = matchEn.labelLeftX
                  relation.rightX = item.labelRightX
                  relation.fromPoint = {
                    x: relation.rightX,
                    c: relation.rightX + relationFontSize,
                  }
                  relation.toPoint = {
                    x: relation.leftX,
                    c: relation.leftX - relationFontSize,
                  }
                } else {
                  relation.leftX = item.labelLeftX
                  relation.rightX = matchEn.labelRightX
                  relation.fromPoint = {
                    x: relation.leftX,
                    c: relation.leftX - relationFontSize,
                  }
                  relation.toPoint = {
                    x: relation.rightX,
                    c: relation.rightX + relationFontSize,
                  }
                }
              } else {
                matchEn = allEnlist.filter(
                  (en) => en.id == relation.fromEntity
                )[0]
                if (matchEn.labelLeftX < item.labelLeftX) {
                  relation.leftX = matchEn.labelLeftX
                  relation.rightX = item.labelRightX
                  relation.fromPoint = {
                    x: relation.leftX,
                    c: relation.leftX - relationFontSize,
                  }
                  relation.toPoint = {
                    x: relation.rightX,
                    c: relation.rightX + relationFontSize,
                  }
                } else {
                  relation.leftX = item.labelLeftX
                  relation.rightX = matchEn.labelRightX
                  relation.fromPoint = {
                    x: relation.rightX,
                    c: relation.rightX + relationFontSize,
                  }
                  relation.toPoint = {
                    x: relation.leftX,
                    c: relation.leftX - relationFontSize,
                  }
                }
              }
              relation.topY = 0
              relation.floor = 1
              let flag = true
              while (flag) {
                if (
                  row.enList.some(
                    (label) =>
                      label.minX < relation.rightX &&
                      label.maxX > relation.leftX &&
                      label.floor == relation.floor
                  ) ||
                  rowRelationList.some(
                    (label) =>
                      label.leftX < relation.rightX &&
                      label.rightX > relation.leftX &&
                      label.floor == relation.floor
                  )
                ) {
                  relation.floor++
                } else {
                  flag = false
                }
              }
              if (relation.floor > row.entRow) {
                row.entRow = relation.floor
              }
              rowRelationList.push(relation)
              allRelationList.push(relation)
            })
          }
        })
      }
      row.rowRelationList = rowRelationList
    })

    // 开始画图
    let totalEntRow = 0 // 标签和关系的总行数
    const enPathList = []
    const relationTextList = []
    const relationPathList = []
    rowContentList.forEach((row) => {
      // 加入文章内容
      newContent.push(
        <tspan
          x={fontSize}
          dy={fontSize * 1.5 + row.entRow * (fontSize + 10)}
          key={row.rowNum}
        >
          {row.span}
        </tspan>
      )
      // 加入实体标签
      row.enList.forEach((item) => {
        const { labelTopY, labelPath } = genLabel(
          item,
          fontSize,
          totalEntRow,
          row.entRow,
          row.rowNum
        )
        enPathList.push(labelPath)
        // 计算关系的起始标签的坐标
        if (item.relationList && item.relationList.length > 0) {
          item.relationList.forEach((relation) => {
            // 计算标签关联的关系的位置
            for (let i = 0; i < allRelationList.length; i++) {
              if (allRelationList[i].id == relation.id) {
                if (!allRelationList[i].topY) {
                  const topY =
                    row.rowNum * lineHeight +
                    (totalEntRow + row.entRow) * labelHeight +
                    fontSize * 0.5 -
                    (relation.floor - 1) * labelHeight -
                    relationFontSize
                  allRelationList[i].topY = topY
                  const leftTextX =
                    (relation.rightX -
                      relation.leftX -
                      relationFontSize * relation.relationText.length) /
                    2
                  allRelationList[i].leftTextX = leftTextX
                }
                if (relation.fromEntity == item.id) {
                  allRelationList[i].fromPoint.y = labelTopY
                } else {
                  allRelationList[i].toPoint.y = labelTopY
                }
                break
              }
            }
          })
        }
      })

      totalEntRow += row.entRow
    })

    // 绘制关系图
    allRelationList.forEach((item) => {
      const relationtext = (
        <g
          key={item.id}
          style={{
            transform: `translate(${item.leftX + item.leftTextX}px, ${
              item.topY - relationFontSize / 2
            }px)`,
          }}
        >
          <rect
            fill="#fff"
            width={item.relationText.length * relationFontSize}
            height={relationFontSize}
          />
          <text
            y={relationFontSize}
            style={{
              fontSize: `${relationFontSize}px`,
              userSelect: 'none',
              cursor: 'pointer',
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              onDeleteRelation(item.id)
            }}
            onMouseEnter={() => {
              setHoverRelationId(item.id)
            }}
            onMouseOut={() => {
              setHoverRelationId
              ('')
            }}
          >
            {item.relationText}
          </text>
        </g>
      )

      relationTextList.push(relationtext)

      const relationPath = (
        <g key={item.id}>
          <path
            className={` ${style.relationPath} ${
              hoverRelationIdRef.current == item.id ? style.hover : ''
            }`}
            d={`M${item.fromPoint.x} ${item.fromPoint.y}
           C ${item.fromPoint.c} ${item.topY},${item.fromPoint.c} ${item.topY} , ${item.fromPoint.x} ${item.topY} 
           L ${item.toPoint.x} ${item.topY} 
           C ${item.toPoint.c} ${item.topY} ,${item.toPoint.c} ${item.topY} , ${item.toPoint.x} ${item.toPoint.y}`}
            stroke="black"
            fill="none"
            strokeWidth="1"
            style={{ markerEnd: ` url('#markerArrow')` }}
          />
        </g>
      )
      relationPathList.push(relationPath)
    })
    setRelationTextGroup(relationTextList)
    setRelationPathGroup(relationPathList)
    setPathGroup(enPathList)
    setShowContent(newContent)
    svgRef.current.setAttribute(
      'height',
      (rowNum + 1) * (fontSize * 1.5) + totalEntRow * (fontSize + 10)
    )
  }

  useEffect(() => {
    render()
  }, [content, list])
  const onMouseUp = (e) => {
    const mouseX = e.pageX || e.clientX // + document.documentElement.scrollLeft || 0 + document.body.scroolLeft || 0 // e.pageX ||
    const mouseY = e.pageY || e.clientY // + document.documentElement.scrollTop || 0 + document.body.scrollTop || 0 // e.pageY// ||
    const text = window.getSelection().toString()
    if (text) {
      // 计算相对于整个文档的定位
      const range = window.getSelection().getRangeAt(0)
      const preSelectionRange = range.cloneRange()
      preSelectionRange.selectNodeContents(childRef.current)
      preSelectionRange.setEnd(range.startContainer, range.startOffset)
      const start = [...preSelectionRange.toString()].length
      const end = start + [...range.toString()].length

      const annotateData = {
        startIndex: start, // 起始索引
        endIndex: end, // 结束索引
        text, // 标注文本内容
        mouseX,
        mouseY,
      }
      console.log('annotateData===',annotateData);
      if (
        (start == 0 &&
          text.replace(/\s+/g, ' ') !=
            content.substr(0, end).replace(/\s+/g, ' ')) ||
        end > content.length
      ) {
        return
      }
      onSelectEn(annotateData)
    }
  }
  return (
    <div className={style.svgContent} ref={divRef}>
      <svg width="100%" ref={svgRef}>
        <marker
          id="markerArrow"
          markerWidth="8"
          markerHeight="10"
          refX="5"
          refY="6"
          orient="auto"
        >
          <path d="M0,4 L0,8 L6,6 L0,4 L0,8" />
        </marker>
        {selectLabel && addRealtionPath}
        {pathGroup}
        {relationPathGroup}
        {relationTextGroup}
        <text
          ref={childRef}
          onMouseUp={(e) => {
            onMouseUp(e, childRef)
            // setselectLabel({})
          }}
        >
          {showContent}
        </text>
      </svg>
      <Modal
        visible={addRelationVisible}
        onCancel={onCancelAddRelation}
        title="添加关系"
        footer={false}
        destroyOnClose
      >
        <div>
          <div className={style.content}>
            <div>
              <span style={{ fontWeight: 'bold' }}>From: </span>
              <span style={{ color: selectLabel.labelColor }}>
                {selectLabel.labelText}
              </span>
              :{selectLabel.text}
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}> To: </span>
              <span style={{ color: toLabel.labelColor }}>
                {toLabel.labelText}
              </span>
              :{toLabel.text}
            </div>
            <div className={style.label}>选择关系:</div>
            <Radio.Group onChange={onSelectRelation}>
              {optionList.map((option) => {
                return (
                  <Radio value={option} key={option.id} data>
                    {option.text}
                  </Radio>
                )
              })}
            </Radio.Group>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default SvgContentIndex
