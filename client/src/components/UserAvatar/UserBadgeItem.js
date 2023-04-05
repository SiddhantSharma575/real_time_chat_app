import { CloseIcon } from '@chakra-ui/icons'
import { Box, Text } from '@chakra-ui/react'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const UserBadgeItem = ({ user, handleFunction }) => {
    return (
        <Box
            px={2}
            py={1}
            borderRadius="lg"
            m={1}
            mb={2}
            variant="solid"
            fontSize={12}
            backgroundColor="purple"
            cursor="pointer"
            onClick={handleFunction}
            alignItems={"center"}
            color={"white"}
        >
            <Box>
                <Text> {user.name}</Text>
            </Box>
            <Box pl={1}>
                <FontAwesomeIcon icon={faXmark} />
            </Box>
        </Box>
    )
}

export default UserBadgeItem