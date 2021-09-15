import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'

const Info = ({ show, list }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(show)
    return () => {
      setVisible(false)
    }
  }, [show])
  useEffect(() => {
  })
  return (
    <Modal visible={visible} onCancel={() => setVisible(false)}>
      <div>
        {(list || []).map(item => {
          return <div key={item.id}>{item.relationlText}</div>
        })}
      </div>
    </Modal>
  )
}
export default Info
