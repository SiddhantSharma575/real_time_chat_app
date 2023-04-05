import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box, FormControl, Input, Spinner, Text, useToast } from "@chakra-ui/react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { getSender, getSenderFull } from '../config/ChatsLogic'
import ProfileModel from './miscllenous/ProfileModel'
import UpdateGroupChatModel from './miscllenous/UpdateGroupChatModel'
import axios from 'axios'
import './styles.css'
import ScrollableChat from './ScrollableChat'
import io from "socket.io-client"
import Lottie from "react-lottie"
import animationData from "./animations/Typing.json"
const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;


const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState()
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false)
    const [newMesssage, setNewMessage] = useState();
    const toast = useToast();
    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const defaultOptions = {
        loop: true,
        autoPlay: true,
        animationData: animationData,
        renderSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }


    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true))
        socket.on("stop typing", () => setIsTyping(false))
    }, [])

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMesssageRecived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMesssageRecived.chat._id) {
                // give notification
                if (!notification.includes(newMesssageRecived)) {
                    setNotification([newMesssageRecived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMesssageRecived])
            }
        })
    })


    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            setLoading(true);
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id)
        } catch (error) {
            toast({
                title: "Error Occured",
                description: "Failed to send the message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })

        }
    }

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMesssage) {
            socket.emit("stop typing", selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }
                setNewMessage("");
                const { data } = await axios.post("/api/message", {
                    content: newMesssage,
                    chatId: selectedChat._id
                }, config)

                console.log(data);
                socket.emit("new message", data)
                setMessages([...messages, data])
            } catch (error) {
                toast({
                    title: "Error Occured",
                    description: "Failed to send the message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })

            }
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        // Typing Indicator Logic
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id)
        }

        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false)
            }
        }, timerLength)
    }

    return (
        <>
            {
                selectedChat ? (
                    <>
                        <Text
                            fontSize={{ base: "28px", md: "30px" }}
                            pb={3}
                            px={2}
                            w="100%"
                            fontFamily="sans-serif"
                            display="flex"
                            justifyContent={{ base: "space-between" }}
                            alignItems="center">
                            <Box display={{ base: 'flex', md: "none", }} cursor={"pointer"} onClick={() => setSelectedChat("")}>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </Box>
                            {!selectedChat.isGroupChat ? (
                                <>
                                    {
                                        getSender(user, selectedChat.users)
                                    }
                                    <ProfileModel user={getSenderFull(user, selectedChat.users)} />
                                </>
                            ) : <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModel
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                    fetchMessages={fetchMessages}
                                />
                            </>}
                        </Text>
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="flex-end"
                            p={3}
                            bg="#E8E8E8"
                            w="100%"
                            h="100%"
                            borderRadius="lg"
                            overflowY="hidden"
                        >
                            {
                                loading ? (
                                    <Spinner
                                        size='xl'
                                        w={20}
                                        h={20}
                                        alignSelf="center"
                                        margin="auto"
                                    />
                                ) : (
                                    <div className="messages">
                                        <ScrollableChat messages={messages} />
                                    </div>
                                )
                            }
                            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                                {isTyping ? <Lottie
                                    width={70}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                    options={defaultOptions}
                                /> : <></>}
                                <Input variant="filled" bg="#E0E0E0" placeholder="Enter a Message" value={newMesssage} onChange={typingHandler} />
                            </FormControl>
                        </Box>
                    </>

                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="3xl" pb={3} fontFamily="sans-serif">
                            Click on a user to start chatting
                        </Text>
                    </Box>
                )
            }
        </>
    )
}

export default SingleChat