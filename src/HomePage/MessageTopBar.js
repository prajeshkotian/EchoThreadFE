import React from 'react'
import PropTypes from 'prop-types'
import { Avatar } from 'antd'

function MessageTopBar({selectedFriend, ...props}) {
  return (
    <div className='message-top-bar'>
      <div className='top-bar-container'>
        {selectedFriend ? <Avatar>{selectedFriend ? selectedFriend.slice(0,2).toUpperCase() : ''}</Avatar>:null}
        {/* <img src={FallbackImage} width={30} height={30} className='image'/> */}
        <span className='user-name'>{selectedFriend || ""}</span>
      </div>
    </div>
  )
}

MessageTopBar.propTypes = {

}

export default MessageTopBar

