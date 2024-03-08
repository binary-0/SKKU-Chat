$(document).ready(function() {
    const token = sessionStorage.getItem('access_token');
    getFriend();

    $("#groupChatButton").click(function() {
        const selectedFriends = Array.from(document.querySelectorAll('.friendItem.selected')).map(item => item.textContent);

        let myID = token;
        let selectedFriendsStr = selectedFriends.join("+");
        let groupChatID = token + '+' + selectedFriendsStr;
        sessionStorage.setItem('chatID', groupChatID);
        loadPage('chat');
    });

    async function getFriend() {
        let friendList = $(`#userApp_id #friendList`);
    
        const response = await fetch('http://localhost:8000/getFriend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID: token,
                friend: 'none'
            }),
        });
    
        if (response.status === 200) {
            const data = await response.json();
            console.log(data);
            data.forEach(item => {
                let friendBlock = document.createElement("button");
                friendBlock.id = item.friend;
                friendBlock.className = "friendItem";
                friendBlock.textContent = item.friend;
                friendBlock.addEventListener("click", function() {
                    toggleSelection(friendBlock);
                });
    
                friendList.append(friendBlock);
            });
        }
        else {
            // do nothing
        }
    }

    function toggleSelection(element) {
        element.classList.toggle('selected');
        if(element.classList.contains('selected'))
            element.style.backgroundColor = 'gray';
        else
            element.style.backgroundColor = '#eee'
    }

    function loadPage(page) {
        window.location.href = page;
    }
});
