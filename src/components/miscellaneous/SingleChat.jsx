import React from 'react'
import { ChatState } from '../../Context/ChatProvider'
import {Box,FormControl,IconButton,Input,Spinner,Text, useToast} from '@chakra-ui/react'
import {ArrowBackIcon} from '@chakra-ui/icons'
import { getSender,getSenderFull } from '../../config/ChatLogic'
import ProfileModel from '../miscellaneous/ProfileModel'
import UpdateGroupChatModal from './UpdateGroupChatModal'
import {useState,useEffect} from 'react';
import axios from 'axios'
import './styles.css'
import ScrollableChat from './ScrollableChat'
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../../animation/typing.json'

const ENDPOINT = "https://mern-chat-talk-backend.onrender.com";
var socket,selectedChatCompare;

const SingleChat = ({fetchAgain,setFetchAgain}) => {
  const [messages,setMessages] = useState([]);
  const [loading,setLoading] = useState(false);
  const [newMessage,setNewMessage] = useState()
  const [socketConnected,setSocketConnected] = useState(true);
  const [typing,setTyping] = useState(false);
  const [isTyping,setIsTyping]= useState(false);

  const {selectedChat,setSelectedChat, user,notification,setNotification} = ChatState()
  const toast = useToast();

  const fetchMessages = async () =>{
    if(!selectedChat)return;

    try{
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }}
        setLoading(true);

        const {data} = await axios.get(`https://mern-chat-talk-backend.onrender.com/api/message/${selectedChat._id}`,config);
        setMessages(data);
        setLoading(false);

        socket.emit("join chat", selectedChat._id);
    }catch(err){
      toast({
        title: "Error Occured",
        description: "Failed to send the message",
        status:"error",
        duration: 5000,
        isClosable:true,
        position: "absolute"

      })
    }

  }
  
  const sendMessage = async(e) =>{
    if(e.key==="Enter" && newMessage){
      socket.emit('stop typing', selectedChat._id);
      try{
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          }
        }
        setNewMessage("");
        const {data} = await axios.post('https://mern-chat-talk-backend.onrender.com/api/message',{
          content:newMessage,
          chatId: selectedChat._id
        },config)
        socket.emit('new message', data);
        setMessages([...messages,data])

      }catch(err){
        toast({
          title: "Error Occured",
          description: "Failed to send the message",
          status:"error",
          duration: 5000,
          isClosable:true,
          position: "absolute"

        })
      }
    }

  }
    
  useEffect(()=>{
    socket = io(ENDPOINT)
    socket.emit('setup',user);
    socket.on('connected',()=>{setSocketConnected(true); })
    socket.on('typing', ()=> setIsTyping(true));
    socket.on('stop typing', ()=> setIsTyping(false));
  },[])
  useEffect(()=>{
    fetchMessages();
    selectedChatCompare = selectedChat;
  },[selectedChat])
  useEffect(()=>{
    socket.on("message received", (newMessageReceived)=>{
      if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){
        if(!notification.includes(newMessageReceived)){
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      }else{
        setMessages([...messages, newMessageReceived]);
      }
    })
  })
  

  const typingHandler = (e)=>{
    setNewMessage(e.target.value)

    //Typing indicator logic

    if(!socketConnected) return

    if(!typing){
      setTyping(true)
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(()=>{
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if(timeDiff>=timerLength && typing){
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    },timerLength)
  } 

  const defaultOptions = {
    loop:true,
    autoplay:true,
    animationData: animationData,
    rendererSettings:{
      preserveAspectRation: "xMidYmid slice"
    }
  }

 


  return (
    <>
    {selectedChat ? (
      <>
        <Text
          fontSize={{base: "28px", md:"30px"}}
          pb={3}
          px={2}
          w="100%"
          fontFamily="Work sans"
          display="flex"
          justifyContent={{base: "space-between"}}
          alignItems="center"
        >
          <IconButton
            display={{base: "flex", md: "none"}}
            icon={<ArrowBackIcon/>}
            onClick={()=>setSelectedChat("")}
          /> 
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user,selectedChat.users)}
                <ProfileModel user={getSenderFull(user,selectedChat.users)}/>
              </>
            ): (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain} 
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>

            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#e8e8e8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ): 
            <div className='messages'>
              <ScrollableChat messages={messages}/>
            </div>}
            <FormControl
              onKeyDown={sendMessage}
              isRequired
              mt={3}
            >
              {isTyping ? <div><Lottie 
                options={defaultOptions}
                width={70}
                style={{marginBottom:15,marginLeft:0}}

              /></div> : <></>}
              <Input 
                variant="filled"
                bg="#e0e0e0"
                placeholder='Enter a message...'
                onChange = {typingHandler}
                value={newMessage}
              />

            </FormControl>
          </Box>
      </>
    ): (
      <Box 
        display="flex" 
        alignItems="center"
        justifyContent="center"
        h="100%" 
      >
        <Text 
          fontSize="3xl"
          pb={3}
          fontFamily="Work sans"
          color="black"
        >
          Click on a user to start chatting
        </Text>

      </Box>
      
    )}
    </>
  )
}

export default SingleChat
