/* eslint-disable func-names */
import React, { useEffect, useState, useRef } from 'react'
import { Button, Radio, Popover, Icon, Badge, Row, Col } from 'antd'
import RelationInfo from './relationInfo'
import style from './index.less'

const Content = ({
  content,
  list,
  onRemoveLabel,
  onSelectEn,
  connections,
  // relationList,
  onAddRelation,
  onDeleteRelation,
}) => {
  const [popEntity, setPopEntity] = useState({})
  const [fromEntity, setFromEntity] = useState({})
  // const [toEntity, setToEntity] = useState({})
  const [showContent, setShowContent] = useState('')
  const [relationInfoShow, setRelationInfoShow] = useState()
  const [showRelationList, setShowRelationList] = useState()
  const childRef = useRef(null)
  let onTimer = null
  let leaveTimer = null
  // useEffect(() => {
  //   console.log('useEffect===')
  //   render()
  // })
  useEffect(() => {
    render()
  }, [content, list, popEntity, fromEntity]) // relationList

  const onStartRelation = () => {
    // const entity =
    setFromEntity({ ...popEntity })
    setPopEntity({})
    document.body.oncontextmenu = e => {
      e.preventDefault()
      setFromEntity({})
      document.body.oncontextmenu = null
    }
  }
  const onSelectRelation = e => {
    const label = e.target.value
    const data = {
      fromEntity: fromEntity.id,
      toEntity: popEntity.id,
      connectionId: label.id,
    }
    onAddRelation(data)
    setFromEntity({})
    setPopEntity({})
  }
  const onMouseOver = item => {
    clearTimeout(leaveTimer)
    onTimer = setTimeout(() => {
      if (item.id != popEntity.id) {
        setPopEntity({ ...item })
      }
    }, 300)
  }
  const onMouseLeave = () => {
    clearTimeout(onTimer)
    leaveTimer = setTimeout(() => {
      if (popEntity.id) {
        setPopEntity({})
      }
    }, 300)
  }
  const onMouseUp = e => {
    const mouseX = e.pageX || e.clientX // + document.documentElement.scrollLeft || 0 + document.body.scroolLeft || 0 // e.pageX ||
    const mouseY = e.pageY || e.clientY // + document.documentElement.scrollTop || 0 + document.body.scrollTop || 0 // e.pageY// ||
    const text = window.getSelection().toString()
    if (text) {
      // ????????????????????????????????????
      const range = window.getSelection().getRangeAt(0)
      const preSelectionRange = range.cloneRange()
      preSelectionRange.selectNodeContents(childRef.current)
      preSelectionRange.setEnd(range.startContainer, range.startOffset)
      const start = [...preSelectionRange.toString()].length
      const end = start + [...range.toString()].length

      const annotateData = {
        startIndex: start, // ????????????
        endIndex: end, // ????????????
        text, // ??????????????????
        mouseX,
        mouseY,
      }
      // ???????????????????????????
      console.log('annotateData===', annotateData)
      const flag = list.some(
        item =>
          (start < item.startIndex && end > item.endIndex) ||
          (start > item.startIndex && start < item.endIndex) ||
          (end > item.startIndex && end < item.endIndex)
      )
      if (flag) {
        return
      }
      // ????????????????????? (??????????????????????????????????????? )
      if (
        (start == 0 && text.replace(/\s+/g, ' ') != content.substr(0, end).replace(/\s+/g, ' ')) ||
        end > content.length
      ) {
        return
      }
      onSelectEn(annotateData)
    }
  }
  const render = () => {
    // content = content.replace(/\r\n/g, '\n')
    list = list.sort((a, b) => a.startIndex - b.startIndex)
    if (list.length == 0) {
      setShowContent(content)
      return
    }
    const addcontent = []
    list.forEach(item => {
      let popInfoContent = null
      let popConnContent = null
      if (fromEntity.id && fromEntity.id != item.id) {
        const optionList = connections.filter(
          option => option.fromLabelId == fromEntity.labelId && option.toLabelId == item.labelId
        )
        popConnContent = (
          <div
            onMouseEnter={() => onMouseOver(item)}
            onMouseLeave={onMouseLeave}
            className={style.labelInfoPop}
          >
            <div className={style.title}>????????????</div>
            <div className={style.content}>
              <div>
                <span style={{ fontWeight: 'bold' }}>From: </span>
                <span style={{ color: fromEntity.labelColor }}>{fromEntity.labelText}</span>:
                {fromEntity.text}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}> To: </span>
                <span style={{ color: popEntity.labelColor }}>{popEntity.labelText}</span>:
                {popEntity.text}
              </div>
              <div className={style.label}>????????????:</div>
              <Radio.Group onChange={onSelectRelation}>
                {optionList.map(option => {
                  return (
                    <Radio value={option} key={option.id} data>
                      {option.text}
                    </Radio>
                  )
                })}
              </Radio.Group>
            </div>
          </div>
        )
      } else {
        const relationInfoList = item.relationList || []
        popInfoContent = (
          <div
            onMouseEnter={() => onMouseOver(item)}
            onMouseLeave={onMouseLeave}
            className={style.labelInfoPop}
          >
            <div style={{ color: popEntity.labelColor }} className={style.title}>
              {popEntity.labelText}
            </div>
            <div className={style.content}>
              <div className={style.text}>{popEntity.text}</div>
              <div className={style.relationInfo}>
                <div className={style.label}>
                  ??????:
                  {/* {relationInfoList.length > 0 && (
                    <Icon
                      onClick={() => {
                        setRelationInfoShow(true)
                        setShowRelationList([...relationInfoList])
                        setPopEntity({})
                      }}
                      type="exclamation-circle"
                    />
                  )} */}
                </div>
                {relationInfoList.length == 0 && '??????'}
                {relationInfoList.map(re => (
                  <div>
                    <Row
                      style={{
                        textAlign: 'center',
                        margin: '5px 0',
                        borderBottom: '1px dashed #ccc',
                      }}
                    >
                      <Col span={21}>
                        <Row style={{ fontWeight: 'bold' }}>
                          <Col span={8} style={{ color: re.fromLabelColor }}>
                            {re.fromLabelText}
                          </Col>
                          <Col span={8}>{re.relationText}</Col>
                          <Col span={8} style={{ color: re.toLabelColor }}>
                            {re.toLabelText}
                          </Col>
                        </Row>
                        <Row>
                          <Col span={8}>{re.fromEntityText}</Col>
                          <Col span={8}>
                            <Icon type="arrow-right" />
                          </Col>
                          <Col span={8}>{re.toEntityText}</Col>
                        </Row>
                      </Col>
                      <Col span={3}>
                        <Icon
                          type="delete"
                          onClick={() => {
                            onDeleteRelation(re.id)
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </div>
            <div className={style.footer}>
              {fromEntity.id && fromEntity.id == item.id ? (
                <Button size="small" onClick={() => setFromEntity({})}>
                  ????????????
                </Button>
              ) : (
                <Button type="primary" onClick={() => onStartRelation(popEntity.id)} size="small">
                  <Icon type="plus" /> ????????????
                </Button>
              )}
              <Button type="danger" onClick={() => onRemoveLabel(popEntity.id)} size="small">
                <Icon type="delete" />
                ????????????
              </Button>
            </div>
          </div>
        )
      }

      addcontent.push(
        <Popover
          placement="top"
          visible={popEntity.id == item.id}
          title={null}
          content={fromEntity.id && fromEntity.id != item.id ? popConnContent : popInfoContent}
          overlayClassName={style.popover}
        >
          <span
            style={{ backgroundColor: item.labelColor }}
            className={style.labelAn}
            onMouseOver={() => onMouseOver(item)}
            onMouseLeave={onMouseLeave}
          >
            {content.substring(item.startIndex, item.endIndex)}
            {item.relationList?.length > 0 && <Badge dot />}
          </span>
        </Popover>

        // `<span  style='background-color:${item.label.color}' class='${
        //   style.labelAn
        // } ${'label'}' entId=${item.id}  >${item.text}</span>`
      )
    })
    const arr = []
    for (let i = 0; i < addcontent.length; i++) {
      let start = 0
      if (i > 0) {
        start = list[i].startIndex
      }
      // ??????????????????
      if (i < addcontent.length - 1) {
        arr.push(content.slice(start, list[i].startIndex))
        arr.push(addcontent[i])
        arr.push(content.slice(list[i].endIndex, list[i + 1].startIndex))
      } else {
        arr.push(content.slice(start, list[i].startIndex))
        arr.push(addcontent[i])
        arr.push(content.slice(list[i].endIndex))
      }
    }

    // let showContent = ''
    // for (let i = 0; i < addcontent.length; i++) {
    //   let start = 0
    //   if (i > 0) {
    //     start = list[i].startIndex
    //   }
    //   if (i < addcontent.length - 1) {
    //     showContent +=
    //       content.slice(start, list[i].startIndex) +
    //       addcontent[i] +
    //       content.slice(list[i].endIndex, list[i + 1].startIndex)
    //   } else {
    //     showContent +=
    //       content.slice(start, list[i].startIndex) +
    //       addcontent[i] +
    //       content.slice(list[i].endIndex)
    //   }
    // }
    setShowContent(arr)
  }
  return (
    <div>
      <div
        className="anContent"
        onMouseUp={e => {
          onMouseUp(e)
          // setFromEntity({})
        }}
        style={{ cursor: fromEntity.id ? 'crosshair' : 'default' }}
        ref={childRef}
      >
        {showContent}
      </div>
      {/* <div
        className="anContent"
        dangerouslySetInnerHTML={{ __html: showContent }}
        onMouseUp={onMouseUp}
      /> */}
      <RelationInfo show={relationInfoShow} list={showRelationList} />
    </div>
  )
}

export default Content
