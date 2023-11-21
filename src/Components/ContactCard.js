import React from 'react'
import PropTypes from 'prop-types'
import { Avatar } from 'antd'


function ContactCard({contact, onSelectFriend, selectedFriend,...props}) {
  return (
    <div className={'contact-card'+ (selectedFriend == contact ? ' selected' : '') } onClick={()=>onSelectFriend(contact)}>
        <div className='profile-container'>
            <div className='image-container'>
                {/* <img src={FallbackImage} width={30} height={30} className='image'/> */}
                <Avatar>{ contact ? contact.slice(0,2).toUpperCase() : ''}</Avatar>
            </div>
            <div className='data-container'>
                {/* <span>{contact}</span> */}
                <span>{contact}</span>
            </div>
        </div>
    </div>
  )
}

ContactCard.propTypes = {

}

export default ContactCard

