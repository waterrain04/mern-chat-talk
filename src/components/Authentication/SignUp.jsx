import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from "@chakra-ui/react";
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => {
    setShow(!show);
  };
  
  const myToast = (myTitle)=>({
      title: myTitle,
      status: "warning",
      duration: 2000,
      isClosable: true,
      position: "bottom",
     })

  const postDetails = async (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast(myToast("Please Select An Image!"))
      return;
    }
    console.log(pics);
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dq7h5llud");
      
      try {
        const response = await fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
          method: "post",
          body: data,
        });
  
        if (!response.ok) {
          throw new Error("Image upload failed");
        }
  
        const responseData = await response.json();
        setPic(responseData.url.toString());
        console.log(responseData.url.toString());
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    } else {
      toast(myToast("Please Select an Image"))
      setLoading(false);
      return;
    }
  };

  const handleSubmit = async() => {
    setLoading(true);
    if(!name|| !email || !password || !confirmPassword){
      toast(myToast("Please fill all input fields"))
      setLoading(false)
      return
    }
    if(password !== confirmPassword){
      toast(myToast("Password does not match"))
      setLoading(false);
      return
    }
    try {
      const { data } = await axios.post("https://mern-chat-talk-backend.onrender.com/api/user", { name, email, password, pic }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      toast({
        title:"Registration Success",
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
        title:"Email has been Registered",
        status: "warning",
        duration: 3000,
        isClosable:true,
        position: "bottom",
      })
      setLoading(false);
    }


  };



  return (
    <VStack spacing="5px">
      <FormControl id="myName" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />
      </FormControl>
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
      
      <FormControl id="confirmPassword" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show? "text": 'password'}
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show? "Hide": "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

    <FormControl id="pic">
      <FormLabel> Upload your Picture</FormLabel>
      <Input
        type="file"
        p={1.5}
        accept="image/*"
        onChange={(e)=> postDetails(e.target.files[0])}
      />
    </FormControl>

    
    <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={handleSubmit}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  )
}

export default SignUp
