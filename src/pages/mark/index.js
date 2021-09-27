import React, { useState } from 'react'
import Annotation from '@/components/annotation'
let enId = 1
let reId = 1
export default function Index() {
  const [entities, setEntities] = useState([])
  const [relations, setRelations] = useState([])
  const labels = [
    { id: 1, labelColor: '#FF0000', text: '疾病' },
    { id: 2, labelColor: '#00FF00', text: '药品' },
  ]
  const connections = [
    { id: 1, fromLabelId: 1, toLabelId: 1, text: '并发症' },
    { id: 2, fromLabelId: 2, toLabelId: 2, text: '协同作用' },
    { id: 3, fromLabelId: 2, toLabelId: 1, text: '过敏反应' },
    { id: 4, fromLabelId: 1, toLabelId: 2, text: '治疗药物' },
  ]
  const onAddEntity = (data) => {
    const newData = Object.assign({}, data)
    newData.id = enId++
    const newList = [...entities]
    newList.push(newData)
    console.log('onAddEntity newData===', newData)
    console.log('onAddEntity newList===', newList)
    setEntities([...newList])
  }
  const onDeleteEntity = (id) => {
    const newList = entities.filter((item) => item.id != id)
    const newReList = relations.filter(
      (item) => item.fromEntity != id && item.toEntity != id
    )
    setRelations([...newReList])
    setEntities([...newList])
  }
  const onAddRelation = (data) => {
    data.id = reId++
    const newList = relations
    newList.push(data)
    setRelations([...newList])
  }
  const onDeleteRelation = (id) => {
    const newList = relations.filter((item) => item.id != id)
    setRelations([...newList])
  }
  return (
    <div style={{ margin: '100px 0' }}>
      <Annotation
        content={`\r\n\r\n出院诊断：\r\n    1.左股骨颈骨折（Garden Ⅲ型） 2.左肱骨近端骨折术后 3.喉癌术后 4.低钾血症\r\n\r\n出院情况及医嘱：出院时患者一般情况良好，未诉特殊不适；生命体征平稳，心肺腹检查正常。患肢末梢血运及皮肤感觉均正常，伤口无红肿及渗出，缝线未拆。出院医嘱：1、出院后继续门诊治疗；2、暂禁止患肢下地及负重活动，于床上行患肢各关节功能恢复锻炼，注意预防下肢深静脉血栓；3、伤口定期清洁换药、拆线；4、术后一月门诊摄片复查，根据复查结果决定下地时间和进一步治疗方案；5、定期门诊复查，门诊随诊。\r\n\r\n                                                            医师签名："`}
        labels={labels}
        connections={connections}
        entities={entities}
        relations={relations}
        onAddEntity={onAddEntity}
        onDeleteEntity={onDeleteEntity}
        onAddRelation={onAddRelation}
        onDeleteRelation={onDeleteRelation}
      />
    </div>
  )
}
