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
        content={`以“左足拇趾外翻畸形术后2年，复发加重6月”为主诉入院。2年前，患者无明显诱因出现左足拇外翻畸形，后左足拇外翻畸形逐渐加重，患者于当地“民生医院”行手术治疗，伤口好转后出院。近6月来，患者左足拇外翻畸形复发明显加重，伴有行走时左足拇趾内侧、足底部疼痛，严重影响患者行走及日常生活，为求诊治来我院就诊，门诊检查后以\" 左足拇外翻畸形术后复发\"诊断收入我科。患者近来，神志清楚，精神、睡眠、饮食正常，大、小便无异常，无心慌、气短，无发热、盗汗及消瘦等症状。高血压病史2年，最高血压达150/90mmHg，长期口服苯磺酸氨氯地平片，现血压控制可。 左足拇趾见陈旧性手术瘢痕，左足第2趾锤状趾畸形，左足第2、3、4跖趾关节跖侧大小约3.0×3.0cm胼胝体，压痛阳性，皮温不高。左足第5趾内翻畸形。左足第2趾间关节活动受限，左足皮肤感觉正常，左足背动脉搏动良好，末梢血运正常。 X线片（西安市红会医院2019-05-07）：左足第2、3趾骨外翻畸形，左足第5趾内翻畸形。 \r\n入院诊断：1.左足拇外翻畸形术后复发 2.左足跖痛症 3.高血压1级（高危险组）   \r\n住院后的治疗及检查情况：入院后完善相关检查，给予对症支持处理、积极术前检查。无明显手术禁忌症后于2019-09-04在神经阻滞麻醉下行左足拇外翻畸形术后复发截骨矫形术，手术顺利，术后予以预防感染，换药等支持对症治疗。复查术后X线示：矫形位置满意，内固定可靠。现患肢肿胀明显消退，切口对合良好，无红肿及渗出，未拆线，末梢感觉及血运良好。上级医师查房，详细告知出院后注意事项，准予患者出院。\r\n出院诊断：1.左足拇外翻畸形术后复发 2.左足跖痛症 3.高血压1级（高危险组）\r\n出院情况及医嘱：出院时患者一般情况良好，未诉特殊不适；生命体征平稳。现患肢肿胀明显消退，切口对合良好，无红肿及渗出，未拆线，末梢感觉及血运良好。出院嘱：1、继续换药，切口愈合后拆线，患肢不负重卧床功能锻炼；2、出院后每月门诊复查（星期四下午），根据复查情况决定下地负重时间。3、出院后3周门诊复查，门诊指导进一步功能锻炼。4、根据复查情况择期手术取出内固定物；5、不适随诊。"`}
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
