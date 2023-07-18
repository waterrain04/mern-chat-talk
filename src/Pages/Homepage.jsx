import React from 'react'
import {Box, Container, Text, Tabs, TabList,Tab,TabPanel,TabPanels} from '@chakra-ui/react'
import LogIn from '../components/Authentication/LogIn'
import SignUp from '../components/Authentication/SignUp'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Homepage = () => {
  const navigate = useNavigate();
  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem("User"));
    if(user){navigate('/chats')}
  },[navigate])
  return (
    <Container maxW="xl" flexDir="column" display="flex" alignItems="center" h="100vh">
      <Box
        d="flex"
        justifyContent={"center"}
        p={3}
        bg={"white"}
        w="100%"
        m="40px 0 15px 0"
        borderRadius='lg'
        borderWidth="1px"
        textAlign={"center"}
        bg="tomato"
      >
        <Text fontSize='4xl' fontFamily='Work sans' color="white" >Chat-TALK</Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs variant='soft-rounded'>
          <TabList mb='1em'>
            <Tab width="50%">Login</Tab>
            <Tab width="50%">SIgn Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <LogIn/>
            </TabPanel>
            <TabPanel>
              <SignUp/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default Homepage
