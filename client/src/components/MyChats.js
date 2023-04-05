import { useToast, Box, Button, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { ChatState } from '../context/ChatProvider';
import { AddIcon } from '@chakra-ui/icons'
import ChatLoading from './ChatLoading';
import { getSender } from '../config/ChatsLogic';
import GroupChatModel from './miscllenous/GroupChatModel';


const MyChats = ({ fetchAgain }) => {
    const [loggedUser, setLoggedUser] = useState();
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
    const toast = useToast();


    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.get("/api/chat", config);
            console.log(data);
            setChats(data)
        } catch (error) {
            console.log(error.messsage)
        }
    }

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats()
    }, [fetchAgain])

    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            p={3}
            bg="white"
            w={{ base: "100%", md: "31%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <Box
                pb={3}
                px={3}
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily="sans-serif"
                d="flex"
                w="100%"
                justifyContent="space-around"
                alignItems="center"
            >
                My Chats
                <GroupChatModel>
                    <Button
                        display="flex"
                        fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                    // rightIcon={<AddIcon />}
                    >
                        New Group Chat
                    </Button>
                </GroupChatModel>
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                p="3"
                bg="#F8F8F8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden">
                {
                    chats ? (
                        <Stack overflowY="scroll">
                            {
                                chats.map((chat) => (
                                    <Box
                                        onClick={() => setSelectedChat(chat)}
                                        cursor="pointer"
                                        bg={selectedChat === chat ? "#3882AC" : "#E8E8E8"}
                                        color={selectedChat === chat ? "white" : "black"}
                                        px="3"
                                        py="2"
                                        borderRadius="lg"
                                        key={chat._id}
                                    >
                                        <Text>
                                            {!chat.isGroupChat ? (
                                                getSender(loggedUser, chat.users)
                                            ) : chat.chatName}
                                        </Text>
                                    </Box>
                                ))
                            }
                        </Stack>
                    ) : (
                        <ChatLoading />
                    )}
            </Box>
        </Box>
    )
}

export default MyChats;