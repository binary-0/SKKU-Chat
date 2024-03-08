$(document).ready(function() {
    const token = sessionStorage.getItem('access_token');
    const chatID = sessionStorage.getItem('chatID');
    // console.log(token);
    // console.log(chatID);

    let ws = new WebSocket("ws://localhost:8000/ws");
    
    let myChatList = $(`#userApp_id .kakaotalkCanvas .chatList`);

    $.getJSON("/getchatlist", function(chatlist) {
        chatlist.forEach(item => {
            if(item.userID === token && item.chatID === chatID) {
                myChatList[0].innerHTML = item.chatList;
                
                $(`#userApp_id .kakaotalkCanvas`).scrollTop($(`#userApp_id .kakaotalkCanvas .chatList`)[0].scrollHeight);
            }
        });
    });
  
    ws.onmessage=function(event) {
        //let messageTextarea = $(`#messageTextarea_id`);
        if(token === -1)
            return;

        let myMessageJSON = JSON.parse(event.data);
        //console.log(myMessageJSON);

        let chatIDList = myMessageJSON["chatID"].split('+');

        if(chatIDList.length === 1) {
            if(token === myMessageJSON["userID"])
                return;
            if(token !== myMessageJSON["chatID"])
                return;
            if(chatID !== myMessageJSON["userID"])
                return;
        }
        else {
            if(token === myMessageJSON["userID"])
                return;

            if(chatID !== myMessageJSON["chatID"])
                return;
        }

        let divTop = document.getElementsByClassName('kakaotalkCanvas')[0].scrollTop;

        let myMessageBlock;
        if(myMessageJSON["isRespond"] === "true") {
            myMessageBlock = `
            ${myMessageJSON["userID"]}
            <div class="messageBlock" id="${divTop}" onclick="messageScroll(${myMessageJSON['scrollID']})">
                <div class="counterMessage">
                    ${myMessageJSON["messageText"]}
                </div>
                <span class="counterTimestamp">${myMessageJSON["timestamp"]}</span>
            </div>
            `;
        }
        else {
            myMessageBlock = `
            ${myMessageJSON["userID"]}
            <div class="messageBlock" id="${divTop}" onclick="messageResponse(this, '${myMessageJSON["userID"]}', '${myMessageJSON["messageText"]}')">
                <div class="counterMessage">
                    ${myMessageJSON["messageText"]}
                </div>
                <span class="counterTimestamp">${myMessageJSON["timestamp"]}</span>
            </div>
            `;
        }
        
        let myChatList = $(`#userApp_id .kakaotalkCanvas .chatList`);
        myChatList.append(myMessageBlock);

        let data = {"userID": token, "chatID": chatID, "chatList": myChatList[0].innerHTML, "lastChat": myMessageJSON["messageText"]};
        $.ajax({
            url: "/setchatlist",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
            success: function() {}
        });

        $(`#userApp_id .kakaotalkCanvas`).scrollTop($(`#userApp_id .kakaotalkCanvas .chatList`)[0].scrollHeight);
    };

    $("#sendButton_id").click(function() {
        sendMessage();
    });

    $("#messageTextarea_id").on('keyup', function(event) {
        if(event.which === 13) {
            if(!event.shiftKey) {
                sendMessage();
            }
        }
    })

    function sendMessage() {
        if(token === -1)
            return;

        let messageTextarea = $(`#messageTextarea_id`);

        let messageText = messageTextarea.val();
        let timestamp = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

        let userID = token;

        if(messageText.trim().length === 0) {
            messageTextarea.val('');
            return;
        }

        messageText = messageText.replace(/\n/g, '<br>');
        
        let myMessageBlock, theriMessageJSON;
        if(isResponding === 0) {
            myMessageBlock = `
                <div class="messageBlock">
                    <span class="userTimestamp">${timestamp}</span>
                    <div class="userMessage">
                        ${messageText}
                    </div>
                </div>
            `;
            
            theriMessageJSON = {
                "userID" : userID,
                "messageText": messageText,
                "timestamp": timestamp,
                "chatID": chatID,
                "isRespond": "false"
            }
        }
        else {
            messageText = `<p class=${"respondText"}>Responding: ${"<br/>"}${respondingText} by ${respondingUserID}<p>`  + messageText;

            myMessageBlock = `
                <div class="messageBlock" onclick="messageScroll(${respondingID})">
                    <span class="userTimestamp">${timestamp}</span>
                    <div class="userMessage">
                        ${messageText}
                    </div>
                </div>
            `;
            
            theriMessageJSON = {
                "userID" : userID,
                "messageText": messageText,
                "timestamp": timestamp,
                "chatID": chatID,
                "isRespond": "true",
                "scrollID": respondingID
            }

            isResponding = 0;
            obj = document.getElementById('respondStatus');
            obj.style.visibility = 'hidden';
        }

        
        let myChatList = $(`#userApp_id .kakaotalkCanvas .chatList`);
        myChatList.append(myMessageBlock);

        // 메시지 입력창 비우기
        messageTextarea.val('');

        ws.send(JSON.stringify(theriMessageJSON));
        
        let data = {"userID": token, "chatID": chatID, "chatList": myChatList[0].innerHTML, "lastChat": messageText};
        // console.log(data);
        $.ajax({
            url: "/setchatlist",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
            success: function() {}
        });
        
        $(`#userApp_id .kakaotalkCanvas`).scrollTop($(`#userApp_id .kakaotalkCanvas .chatList`)[0].scrollHeight);
    }
});

let isResponding = 0;
let respondingID;
let respondingUserID;
let respondingText;

function messageResponse(element, userID, text) {
    respondingID = element.id;
    text.trim();
    obj = document.getElementById('respondStatus');
    obj.innerHTML = `Responding: ${text} by ${userID}`
    obj.style.visibility = 'visible';
    respondingUserID = userID;
    respondingText = text;
    
    isResponding = 1;
}

function messageScroll(idValue) {
    $(`#userApp_id .kakaotalkCanvas`).scrollTop(idValue);
}