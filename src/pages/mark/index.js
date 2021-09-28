import React, { useState } from 'react'
import Annotation from '@/components/annotation'
let enId = 1
let reId = 1
let newEntities = []
let newRelations = []
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
    { id: 5, fromLabelId: 1, toLabelId: 1, text: '症状' },
    { id: 6, fromLabelId: 2, toLabelId: 2, text: '拮抗作用' },
  ]
  const onAddEntity = (data) => {
    const newData = Object.assign({}, data)
    newData.id = enId++
    const newList = [...newEntities]
    newList.push(newData)
    newEntities = [...newList]
    setEntities(newEntities)
  }
  const onDeleteEntity = (id) => {
    const newList = newEntities.filter((item) => item.id != id)
    const newReList = relations.filter(
      (item) => item.fromEntity != id && item.toEntity != id
    )
    setRelations([...newReList])
    newEntities = newList
    setEntities([...newList])
  }
  const onAddRelation = (data) => {
    const newList = newRelations
    if (data.id) {
      const index = newRelations.findIndex((item) => item.id == data.id)
      newRelations[index] = data
    } else {
      data.id = reId++
      newList.push(data)
      newRelations = newList
    }
    setRelations([...newList])
  }
  const onDeleteRelation = (id) => {
    const newList = relations.filter((item) => item.id != id)
    setRelations([...newList])
  }
  return (
    <div style={{ margin: '100px 0' }}>
      <Annotation
        content={`2019-06-24 10:02　　　　　出  院  小  结\r\n患者蔡水海，男，79岁，以“摔伤致左髋部肿痛、活动受限2天。”之主诉入院。入院诊断：1.左侧股骨颈骨折 2.左侧肢体肌无力待查 。入院后完善常规检查，择期于2019-06-20在全身麻醉下行“左侧股骨颈骨折人工半髋关节置换术”，手术顺利，术后给予抗炎对症支持治疗。术后复查X线片提示假体安装满意，位置良好。现患者患肢末梢血运及皮肤感觉正常，伤口愈合良好，无红肿及渗出，伤口未拆线出院，请示上级医师同意后准予出院。出院诊断：1.左侧股骨颈骨折；2.左侧肢体肌无力待查；3.颅内占位病变；4.动脉粥样硬化症；5.心律失常：不完全右束支传导阻滞。出院医嘱：1、出院后继续门诊治疗，并规律口服利伐沙班片预防下肢深静脉血栓；2、严禁患肢内收内旋及过度活动；3、逐渐扶助步器下地活动，并继续行患肢各关节功能恢复锻炼；4、伤口定期清洁换药、拆线；5、术后一月门诊摄片复查，根据复查结果决定进一步治疗方案；6、定期门诊复查，门诊随诊；7、继续内科相关疾病治疗。\r\n王虎\r\n`}
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
