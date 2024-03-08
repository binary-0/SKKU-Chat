$(document).ready(function() {
    $("#loginButton_id").click(function() {
        login();
    });

    $("#registerButton_id").click(function() {
        register();
    });

    async function register() {
        const ID = document.getElementById("userID").value;
        const PW = document.getElementById("userPW").value;
    
        const response = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID: ID,
                password: PW
            }),
        });
    
        const data = await response.json();
        // console.log(data);
    }

    async function login() {
        const ID = document.getElementById("userID").value;
        const PW = document.getElementById("userPW").value;
        
        const response = await fetch('http://localhost:8000/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(ID)}&password=${encodeURIComponent(PW)}&grant_type=password`,
        });

        if (response.status === 200) {
            const data = await response.json();

            if (data.isFailed === "0") {
                sessionStorage.setItem('access_token', data.access_token);

                // Redirect to the chat page
                loadPage('friendList');
            }
            else {
                // do nothing
            }
        }
        else {
            // console.error('Login failed');
        }
    }

    function loadPage(page) {
        window.location.href = page;
    }
});