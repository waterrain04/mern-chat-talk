import React from 'react'
import {useState} from 'react';
import {Box, Tooltip,Button, Text, Menu, MenuButton, MenuList,Avatar, MenuItem, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner} from '@chakra-ui/react'
import {BsSearch} from 'react-icons/bs'
import {BellIcon, ChevronDownIcon, ChevronUpIcon} from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@chakra-ui/react';
import axios from 'axios';
import ChatLoading from './ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogic';
import NotificationBadge from 'react-notification-badge'
import { Effect } from 'react-notification-badge';

const SideDrawer = () => {
  const [search,setSearch]= useState("")
  const [searchResult, setSearchResult] = useState([])
  const [loading,setLoading] = useState(false);
  const [loadingChat, setLoadingChat]= useState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast();

  const {user, setSelectedChat,chats,setChats,notification,setNotification} = ChatState()



  const logOutHandler = ()=>{
    localStorage.removeItem("User")
    navigate('/')
  }

  const handleSearch =  async()=>{
    if(!search){
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left"
      })
      return;
    }
    try{
      setLoading(true)
      const config = { 
        headers: { 
          Authorization:`Bearer ${user.token}`,
        }
      }

      const {data} = await axios.get(`https://mern-chat-talk-backend.onrender.com/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);

    }catch(err){
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left"
      })
    }
  }
  const accessChat = async (userId)=>{
    try{
      setLoadingChat(true);
      const config= {
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${user.token}`
        }
      };
      const {data} = await axios.post("https://mern-chat-talk-backend.onrender.com/api/chat",{userId},config)
      console.log(data);

      if(!chats.find(c=>c._id ===data._id)) setChats([data,...chats])
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    }catch(err){
      toast({
        title:"Error fetching the chat",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable:true,
        position: "bottom-left"
      })
    }
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip 
          label="Search Users to chat"
          hasArrow 
          placement="bottom-end"
          >
            <Button variant="ghost" onClick={onOpen}>
              <BsSearch />
              <Text display={{base:"none", md:"flex"}} px="4">
                Search User
              </Text>
            </Button>
        </Tooltip>
        <Text fontSize="3xl" fontWeight="bold" fontFamily="Work sans" color="tomato"> 
          Chat-TALK
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
                <NotificationBadge
                  count={notification.length}
                  effect={Effect.SCALE}
                />
              <BellIcon fontSize="2xl" m={1}/>
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map(notif=>(
                <MenuItem key={notif._id} onClick={()=>{
                  setSelectedChat(notif.chat)
                  setNotification(notification.filter(n=> n!== notif))
                }}>
                  {notif.chat.isGroupChat? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user,notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
                <Avatar 
                  size="sm" 
                  cursor="pointer" 
                  name={user.name} 
                  src={user.pic}/>
              </MenuButton>
              <MenuList>
                <ProfileModel user={user}>
                  <MenuItem>My Profile</MenuItem>
                </ProfileModel>
                <MenuItem onClick={logOutHandler}>LogOut</MenuItem>
              </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay/>
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
            <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder='Search by name or email'
                mr={2}
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
              {loading ? (<ChatLoading/>): (

                searchResult?.map(user=>(
                  <UserListItem 
                    key={user._id}
                    user={user} 
                    handleFunction={()=>accessChat(user._id)}
                  />
                ))

              )}
              {loadingChat && <Spinner ml="auto" display="flex"/>}
            </DrawerBody>
          </DrawerContent>
      </Drawer>
    </>
    )
}

export default SideDrawer
