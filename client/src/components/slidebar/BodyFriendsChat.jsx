import React from 'react';
import ChatCard from "../chat/ChatCard.jsx";
import {useChatStore} from "../../stores/useChatStore.js";

const BodyFriendsChat = ({directConversations}) => {
    console.log("directConversations", directConversations);
    return (
        <>
            {
                directConversations?.length > 0 &&
                directConversations?.map((convo) => {
                    return (
                        <ChatCard convo={convo} key={convo._id } />
                    )
                })
            }

        </>
    );
};

export default BodyFriendsChat;