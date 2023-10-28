import React from 'react'
import PropTypes from 'prop-types'

import ListContacts from '../Components/ListContacts'
import TopBar from './TopBar'

function LeftSideBar({onSelectFriend, friendList, selectedFriend, ...props}) {
    const contactList=[{name:'abc', email:'abc@gmail.com', id: 1},
    {name:'xyz', email:'xyz@gmail.com', id: 2},
    {name:'def', email:'def@gmail.com', id: 3}]
  return (
    <div className='left-side-bar'>
        <TopBar />
        <ListContacts contactList={contactList} onSelectFriend={onSelectFriend} friendList={friendList} selectedFriend={selectedFriend}/>
    </div>
  )
}

LeftSideBar.propTypes = {

}

export default LeftSideBar

