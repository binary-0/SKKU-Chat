$(document).ready(function() {
    const token = sessionStorage.getItem('access_token');
    getChatList();

    $("#friendListButton").click(function() {
        loadPage('friendList');
    });
    
    let ws = new WebSocket("ws://localhost:8000/ws");

    async function getChatList() {
        let chatList = $(`#userApp_id #chatList`);

        $.getJSON("/getchatlist", function(chatlist) {
            chatlist.forEach(item => {
                if(item.userID === token) {
                    let chatBlock = document.createElement("button");
                    chatBlock.id = item.chatID;
                    let chatName = replaceAll(item.chatID, '+', ', ');

                    chatBlock.className = "chatListItem";
                    chatBlock.innerHTML = `<p class="chatListNameText">${chatName}</p><p class="chatListprevText">${item.lastChat}</p>`;
                    chatBlock.addEventListener("click", function() {
                        clickChatItem(item.chatID);
                    });

                    chatList.append(chatBlock);
                }
            });
        });
    }

    async function addFriend() {
        friendID = document.getElementById("addFriendText_id").value;
        
        let friendList = $(`#userApp_id #friendList`);

        const response = await fetch('http://localhost:8000/addFriend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID: token,
                friend: friendID
            }),
        });

        if (response.status === 200) {
            const data = await response.json();

            if (data === -1) {
                //do nothing
            }
            else {
                let friendBlock = document.createElement("button");
                friendBlock.id = friendID;
                friendBlock.className = "friendItem";
                friendBlock.textContent = friendID;
                friendBlock.addEventListener("click", function() {
                    clickFriendName(friendID);
                });

                friendList.append(friendBlock);
            }
        }
        else {
            // do nothing
        }
        
        document.getElementById("addFriendText_id").value = '';
    }

    
    ws.onmessage=function(event) {
        //let messageTextarea = $(`#messageTextarea_id`);
        
        if(token === -1)
            return;
        let myMessageJSON = JSON.parse(event.data);
        //console.log(myMessageJSON);

        let chatIDList = myMessageJSON["chatID"].split('+');
        let flag = 0;
        let chatID;
        
        if(chatIDList.length === 1) {
            if(token === myMessageJSON["userID"])
                return;
            if(token !== myMessageJSON["chatID"])
                return;

            chatID = myMessageJSON["userID"];
        }
        else {
            if(token === myMessageJSON["userID"])
                return;

            chatIDList.forEach(item => {
                if(item === token)
                    flag = 1;
            });

            if(flag === 0)
                return;
            chatID = myMessageJSON["chatID"];
        }

        let myMessageBlock = `
            ${myMessageJSON["userID"]}
            <div class="messageBlock">
                <div class="counterMessage">
                    ${myMessageJSON["messageText"]}
                </div>
                <span class="counterTimestamp">${myMessageJSON["timestamp"]}</span>
            </div>
        `;

        let pushNotification = document.getElementById("pushNotification");
        pushNotification.innerHTML = `<p class="notiNameText">${myMessageJSON["userID"]}</p><p class="notiChatText">${myMessageJSON["messageText"]}</p>`;
        pushNotification.style.visibility = "visible";

        let popTimer = setTimeout(() => {
            pushNotification.style.visibility = "hidden";
        }, 2000);

        let myChatList = "";
        $.getJSON("/getchatlist", function(chatlist) {
            if(chatlist.length == 0) {
                myChatList = myMessageBlock;
                let data = {"userID": token, "chatID": chatID, "chatList": myChatList, "lastChat": myMessageJSON["messageText"]};
                $.ajax({
                    url: "/setchatlist",
                    type: "post",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(data),
                    success: function() {
                        console.log('2');
                    }
                });
            }
            chatlist.forEach(function(item, idx, arr){
                if(item.userID === token && item.chatID == chatID) {
                    myChatList = item.chatList;
                    
                    myChatList += myMessageBlock;
                    let data = {"userID": token, "chatID": chatID, "chatList": myChatList, "lastChat": myMessageJSON["messageText"]};
                    $.ajax({
                        url: "/setchatlist",
                        type: "post",
                        contentType: "application/json",
                        dataType: "json",
                        data: JSON.stringify(data),
                        success: function() {
                            console.log('1');
                        }
                    });

                    return;
                }
                else if(idx == arr.length - 1) {
                    myChatList = myMessageBlock;
                    let data = {"userID": token, "chatID": chatID, "chatList": myChatList, "lastChat": myMessageJSON["messageText"]};
                    $.ajax({
                        url: "/setchatlist",
                        type: "post",
                        contentType: "application/json",
                        dataType: "json",
                        data: JSON.stringify(data),
                        success: function() {
                            console.log('2');
                        }
                    });
                }
            });
        });
        
    };

    function clickChatItem(chatID) {
        sessionStorage.setItem('chatID', chatID);
        loadPage('chat');
    }
    
    function loadPage(page) {
        window.location.href = page;
    }

    function replaceAll(str, searchStr, replaceStr) {
        return str.split(searchStr).join(replaceStr);
    }
});