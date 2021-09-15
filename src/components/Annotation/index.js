import React, { useState, useEffect, useRef } from 'react'
import { Radio, message } from 'antd'
// import ShowContent from './content'
import ShowContent from './svgContent'
import style from './index.less'
import { kgCommonService } from '@/services/KnowledgeGraph'
import shortcut from '@/utils/shortcut'

const Content = ({ content, labels, connections, entities, relations }) => {
  const [labelOptionVisible, setLabelOptionVisible] = useState(false)
  const [popPosition, setPopPosition] = useState({ x: 0, y: 0 })
  const [list, setList] = useState([])
  const [relationList, setRelationList] = useState(relations)
  const childRef = useRef()
  const [annotateData, setAnnotateData] = useState()
  useEffect(() => {
    const enList = entities.map((en) => {
      en.relationList = relations.filter(
        (re) => re.fromEntity == en.id || re.toEntity == en.id
      )
      return en
    })
    setList([...enList])
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

  const getEntitys = (relationInfolist) => {
    kgCommonService('getEntitysDto', { ...recordInfo }).then((res) => {
      if (res.data.retCode == '0') {
        let newList = res.data.outData.data
        if (relationInfolist && relationInfolist.length > 0) {
          newList = newList.map((en) => {
            en.relationList = relationInfolist.filter(
              (re) => re.fromEntity == en.id || re.toEntity == en.id
            )
            return en
          })
        }
        setList([...newList])
      }
    })
  }
  const getRelations = () => {
    kgCommonService('getRelationsDto', { ...recordInfo }).then((res) => {
      if (res.data.retCode == '0') {
        const newList = res.data.outData.data
        setRelationList([...newList])
        getEntitys(newList)
      }
    })
  }
  const onSelectLabel = (label, anData) => {
    if (!annotateData && !anData) {
      return
    }
    const enData = annotateData || anData || {}
    const data = {
      ...enData,
      labelId: label.id,
    }
    setLabelOptionVisible(false)
    
  }
  useEffect(() => {
    if (annotateData) {
      labels.forEach((label) => {
        if (label.remark) {
          shortcut.add(label.remark, () => {
            onSelectLabel(label)
            console.log('label.remark===', label.remark)
          })
        }
      })
    }
    return () => {
      labels.forEach((label) => {
        if (label.remark) {
          shortcut.remove(label.remark)
        }
      })
    }
  }, [annotateData])
  const onAddRelation = (data) => {
    kgCommonService('addOrUpdateRelation', { ...data, ...recordInfo })
      .then((res) => {
        if (res.data.retCode == '0') {
          getRelations()
          message.success('添加关系成功!')
        } else {
          message.error(res.data.retMessage)
        }
      })
      .catch((e) => {
        message.error('添加失败!')
      })
  }
  const onClickMask = () => {
    setAnnotateData(null)
    setLabelOptionVisible(false)
  }
  const onRemoveLabel = (id) => {
    kgCommonService('deleteEntity', { id }).then((res) => {
      if (res.data.retCode == '0') {
        getRelations()
      }
    })
  }

  const onDeleteRelation = (id) => {
    kgCommonService('deleteRelation', { id }).then((res) => {
      if (res.data.retCode == '0') {
        getRelations()
      }
    })
  }
  return (
    <div ref={childRef}>
      <ShowContent
        content={content}
        list={list}
        onRemoveLabel={onRemoveLabel}
        onSelectEn={onSelectEn}
        connections={connections}
        relationList={relationList}
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
              <Radio.Group onChange={(e) => onSelectLabel(e.target.value)}>
                {(labels || []).map((item) => {
                  return (
                    <Radio value={item} key={item.id} data>
                      <span>{`${item.text}(${item.remark || ''})`}</span>
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
