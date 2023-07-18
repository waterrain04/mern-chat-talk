import { Input,Button,FormControl, FormLabel, VStack,InputGroup, InputRightElement,useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

const LogIn = () => {
  const [show,setShow] = useState(false);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
   
  const handleClick = () =>{
    setShow(!show)
  }
  
  const handleSubmit = async()=>{
    setLoading(true);
    if(!email || !password){
      toast({
        title: "PLease Fill all the fields",
        status:"warning",
        duration: 5000,
        isClosable:true,
        position:"bottom"
      })
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post("http://localhost:3500/api/user/login", {  email, password }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      toast({
        title:"Log In Success",
        status: "success",
        duration: 2000,
        isClosable:true,
        position: "bottom",
      })
      localStorage.setItem("User", JSON.stringify(data));
      setLoading(false);
      navigate('/chats')
    }catch(err){
      toast({
        title:"Invalid Credentials",
        status: "warning",
        duration: 3000,
        isClosable:true,
        position: "bottom",
      })
      setLoading(false);
    }
  }
  return (
    <VStack spacing="5px">

      <FormControl id="myEmail" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl id="myPassword" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show? "text": 'password'}
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show? "Hide": "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      

    <Button
      colorScheme="blue"
      width="100%"
      style={{marginTop:15}}
      onClick={handleSubmit}
      isLoading={loading}
    >
      Log In
    </Button>
    <Button
      variant="solid"
      colorScheme="red"
      width="100%"
      onClick={()=>{
        setEmail("guest@example.com");
        setPassword("123456")
        handleSubmit()
      }}
    >
      Get Guest User Credentials
    </Button>
    </VStack>
  )
}

export default LogIn
