import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faBell, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { ChatState } from '../../context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useNavigate } from 'react-router-dom';
// import { BellIcon } from "@chakra-ui/icons"
import axios from "axios"
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from "../../config/ChatsLogic"
import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';


const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState()

    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState()
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast()


    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/")
    }


    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post("/api/chat", { userId }, config);
            if (!chats.find((c) => c._id === data._id)) {
                setChats([data, ...chats]);
            }
            setSelectedChat(data);
            setLoadingChat(false);
            onClose()
        } catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })

        }
    }

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please Enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            });
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    return (
        <>
            <Box display={"flex"}
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                w="100%"
                p="5px 10px 5px 10px"
                borderWidth="5px" >
                <Tooltip
                    label="Search Users to Chat"
                    hasArrow
                    placement="bottom">
                    <Button variant={"ghost"} onClick={onOpen}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <Text display={{ base: "none", md: "flex" }} px="4">
                            Search User..
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize={"2xl"} fontFamily="sans-serif">
                    Talk-A-Tive
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <FontAwesomeIcon icon={faBell} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {
                                !notification.length && "No New Messages"
                            }
                            {
                                notification.map(noti => (
                                    <MenuItem key={noti._id} onClick={() => {
                                        setSelectedChat(noti.chat);
                                        setNotification(notification.filter((n) => n !== noti));
                                    }}>
                                        {
                                            noti.chat.isGroupChat ?
                                                `New Messages in ${noti.chat.chatname}`
                                                : `New Message from ${getSender(user, noti.chat.users)}`
                                        }
                                    </MenuItem>
                                ))
                            }
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<FontAwesomeIcon icon={faChevronDown} />}>
                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModel user={user} >
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModel>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">
                        Search Users
                    </DrawerHeader>
                    <DrawerBody>
                        <Box display={"flex"} pb={2}>
                            <Input
                                placeholder="Search By Name or Email"
                                mr="2"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button
                                onClick={handleSearch}
                            >
                                Go
                            </Button>
                        </Box>
                        {
                            loading ? (
                                <ChatLoading />
                            ) : (
                                searchResult?.map((user) => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => accessChat(user._id)}
                                    />
                                ))
                            )
                        }
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer