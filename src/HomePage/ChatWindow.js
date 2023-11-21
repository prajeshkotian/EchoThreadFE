import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import {message, Skeleton, Empty} from 'antd'
import { server_chat_url } from '../config'

import MessageList from '../Components/MessageList'
import MessageInput from '../Components/MessageInput'
import MessageTopBar from './MessageTopBar'
import { base64ToArrayBuffer, importKey, str2ab, aesEncrypt, arrayBufferToBase64, ab2str, aesDecrypt, generateKeyPair, signMessage, verifyMessage } from '../CryptoUtility'
import SpinLoader from '../Components/SpinLoader'
//import { generateRSAKey, rsaEncryptMessage, rsaDecryptMessage } from '../CryptoUtility'

function ChatWindow({selectedFriend, emailId, sharedKey, friendData, selectedDsPublicKey, userDsKey, ...props}) {

  const [newMessage, setMessage] = useState('')
  const [messageList, setMessageList] = useState([])
  const [isLoadingMessages, setLoadingMessages] = useState(false)
  const [isSendingMessage, setSendingMessage] = useState(false)

  const fetchData=async(isPolling)=>{
    if(selectedFriend && !isPolling)
      setLoadingMessages(true)
  if(selectedFriend && emailId){
    fetch(server_chat_url+emailId+'/'+selectedFriend).then((res)=>{
      if(res && res.ok )
          return res.json()
      throw res
  }).then(async (data)=>{
      const receivedMessages = await Promise.all(((data && data.recieved) || []).map(async item=>{
        //verify digital signature of encrypted message
        try{
        const obj={...item}
        const cipherTextBuffer = base64ToArrayBuffer(item.chat)
        // const typedArray = new Uint8Array(cipherTextBuffer)
        // typedArray[0]=1
        const signedMessageBuffer = base64ToArrayBuffer(item.dsValue)
        const isMessageVerified = await verifyMessage(selectedDsPublicKey, signedMessageBuffer, cipherTextBuffer)
        console.log('isMessageVerified :', isMessageVerified)
        obj.isVerified = isMessageVerified
        return obj
        }catch(error){
          console.log(error)
          return Promise.reject(error)
        }
      }));
      const sentMessages = ((data && data.sent) || [])
      const finalMessageList = ([... receivedMessages, ...sentMessages]).sort((a,b) => a.timestamp - b.timestamp)
      const finalMessageListDecrypted =await Promise.all( (finalMessageList || []).map(async (msg)=>{
        try{
          if(msg && msg.chat){
            const newMsg ={
              ...msg
            }

            //decrypt message
            const iv = str2ab(friendData.iv)
            const dec = new TextDecoder()
            const newChatMsg=base64ToArrayBuffer(msg.chat)
            const plainText =await aesDecrypt(iv, sharedKey, newChatMsg)
            const plainTextString = dec.decode(plainText)
            newMsg.chat=plainTextString
            return newMsg
          }
        }
        catch(error){
          console.log(error)
          return Promise.reject(error)
        }
      
      }))
      //tempfunction()
      setMessageList(finalMessageListDecrypted)
      setTimeout(()=>{
        setLoadingMessages(false)
      }, 300)
      
      console.log('isLoading Messages :', isLoadingMessages)
  }).catch(err=>{
      console.log(err)
     // message.error(err.message)
     //setLoadingMessages(false)
  })
  }
  }

  useEffect(()=>{
    console.log("isLoadingMessages :",isLoadingMessages)
  },[isLoadingMessages])
  
  useEffect(()=>{
    if(selectedFriend)
      fetchData(false)
    const intervalId = setInterval(() => {
        // do something else
        fetchData(true)
    }, 10000);
    return ()=> clearInterval(intervalId)
  },[selectedFriend, sharedKey])

  const onEnterKeyPress=(event)=>{
    if(event.keyCode == '13'){
      onMessageSend()
    }
  }

  const onChangeMessage=(event)=>{
    if(event && event.target)
      setMessage(event.target.value)
  }

  const onMessageSend=async()=>{
    if(!newMessage){
      message.error('Please enter a message')
      return
    }
    setSendingMessage(true)
    // const importedKeyBuffer = base64ToArrayBuffer(friendData.key)
    // const importedKey =await importKey("raw", importedKeyBuffer, "AES-GCM")
    
    //encrypt message
    const iv = str2ab(friendData.iv)
    console.log('iv :', iv)
    const enc = new TextEncoder()
    const encData = enc.encode(newMessage)
    console.log("encrypted message buffer", encData)
    const cipherText =await aesEncrypt(iv, sharedKey, encData)
    console.log('cipherText: ',cipherText)
    const cipherTextString = arrayBufferToBase64(cipherText)
    console.log('cipherTextString: ',cipherTextString)

    //sign encrypted message
    const signedMessage = await signMessage(userDsKey, cipherText)
    const signedMessageString = arrayBufferToBase64(signedMessage)
    

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId: emailId, friends: selectedFriend, message: cipherTextString, dsValue: signedMessageString})
    };
    fetch(server_chat_url+'/friend', requestOptions).then((res)=>{
      if(res && res.ok )
          return res.json()
      throw res
  }).then(data=>{
      console.log(data)
      message.success('Message Successfully Sent', 0.8, ()=>{
        setMessage(null)
        setSendingMessage(false)
        fetchData(true)
      })
      
  }).catch(err=>{
      console.log(err)
      //message.error(err)
      setSendingMessage(false)
  })
  }
  const loadedData = <MessageList messageList={messageList || []} emailId={emailId}/>
  const emptyData = <Empty description="No Messages"/>
  return (
    <div className='chat-window'>
      <div className='chat-top-bar'>
        <MessageTopBar selectedFriend={selectedFriend}/>
      </div>
      {!isLoadingMessages ? <div className='message-window'>
        {/* <Skeleton loading={isLoadingMessages } active> */}
          {selectedFriend && messageList.length > 0 ? loadedData : emptyData}
        {/* </Skeleton> */}
      </div> : <SpinLoader size={70}/>}
      <div className='message-input-container'>
        <MessageInput onChangeMessage={onChangeMessage} onMessageSend={onMessageSend} newMessage={newMessage} isSendingMessage={isSendingMessage} onEnterKeyPress={onEnterKeyPress} isLoadingMessages={isLoadingMessages} selectedFriend={selectedFriend}/>
      </div>
    </div>
  )
}

ChatWindow.propTypes = {

}

export default ChatWindow

