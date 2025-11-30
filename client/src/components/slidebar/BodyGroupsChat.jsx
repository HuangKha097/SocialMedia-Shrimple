import React from 'react';
import ChatCard from "../chat/ChatCard.jsx";
import {useChatStore} from "../../stores/useChatStore.js";
import GroupChatCard from "../chat/GroupChatCard.jsx";

const BodyGroupsChat = ({groupConversations}) => {
        console.log("directConversations", groupConversations);
        return (
            <>
                {
                    groupConversations?.length > 0 &&
                    groupConversations?.map((convo) => {
                        return (
                            <GroupChatCard convo={convo} key={convo._id}/>
                        )
                    })
                }

            </>
        );

    }
;

export default BodyGroupsChat;