import React, { useState, useEffect, useRef } from 'react'
import { Radio } from 'antd'
// import ShowContent from './content'
import ShowContent from './svgContent'
import style from './index.module.scss'
import './index.module.scss'

const Content = ({
  content,
  labels,
  connections,
  entities,
  relations,
  onAddEntity,
  onDeleteEntity,
  onAddRelation,
  onDeleteRelation,
}) => {
  const [labelOptionVisible, setLabelOptionVisible] = useState(false)
  const [popPosition, setPopPosition] = useState({ x: 0, y: 0 })
  const [list, setList] = useState([])
  const childRef = useRef()
  const [annotateData, setAnnotateData] = useState()
  useEffect(() => {
    console.log('=useEffect=entities=', entities)
    console.log('=useEffect=relations=', relations)
    const enList = entities.map((en) => {
      const relationList = relations.filter(
        (re) => re.fromEntity == en.id || re.toEntity == en.id
      )
      en.relationList = [...relationList]
      const label = labels.filter((item) => item.id == en.labelId)[0]
      en.labelColor = label.labelColor
      en.labelId = label.id
      en.labelText = label.text
      return en
    })
    const newList = [...enList]
    setList(newList)
  }, [entities, relations])

  const onSelectEn = (v) => {
    const { mouseX, mouseY, ...data } = v
    let x = mouseX
    setAnnotateData(data)
    if (x > document.body.clientWidth - 120) {
      x -= 120
    }
    setPopPosition((preValue) => ({ ...preValue, x, y: mouseY - 120 }))
    setLabelOptionVisible(true)
  }

  const onSelectLabel = (label, anData) => {
    if (!annotateData && !anData) {
      return
    }
    // 修改 删除之前的
    if (annotateData.id) {
      console.log('onSelectLabel annotateData.id===', annotateData.id)
      onDeleteEntity(annotateData.id)
    }
    const enData = annotateData || anData
    const data = {
      ...enData,
      labelId: label.id,
    }
    onAddEntity({ ...data })
    setLabelOptionVisible(false)
    window.getSelection().removeAllRanges()
  }

  const onClickMask = () => {
    setAnnotateData(null)
    setLabelOptionVisible(false)
  }

  return (
    <div ref={childRef}>
      <ShowContent
        content={content}
        list={list}
        onRemoveLabel={onDeleteEntity}
        onSelectEn={onSelectEn}
        connections={connections}
        onAddRelation={onAddRelation}
        onDeleteRelation={onDeleteRelation}
      />
      {labelOptionVisible && (
        <div className={style.popMask} onClick={onClickMask}>
          <div
            className={style.labelPopContent}
            onClick={(e) => {
              e.stopPropagation()
            }}
            style={{ left: popPosition.x, top: popPosition.y }}
          >
            <div className={style.title}>选择标签</div>
            <div className={style.content}>
              <Radio.Group
                onChange={(e) => onSelectLabel(e.target.data)}
                value={annotateData?.labelId}
              >
                {(labels || []).map((item) => {
                  return (
                    <Radio value={item.id} key={item.id} data={item}>
                      <span>{`${item.text}`}</span>
                    </Radio>
                  )
                })}
              </Radio.Group>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Content
