// const friendRequestContainer = document.createElement('div');
// friendRequestContainer.className = 'friend-request-container';


// const refuseButton = document.createElement('button');
// refuseButton.id = 'no-btn'
// refuseButton.setAttribute('user_id', user.id);
// refuseButton.type = 'button';
// refuseButton.className = 'btn btn-request-no';
// refuseButton.innerHTML = '&#10005;'; 


// const acceptButton = document.createElement('button');
// acceptButton.id = 'yes-btn';
// acceptButton.setAttribute('user_id', user.id);
// acceptButton.type = 'button';
// acceptButton.className = 'btn btn-request-yes';
// acceptButton.innerHTML = '&#10003;'; 


// friendRequestContainer.appendChild(refuseButton);
// friendRequestContainer.appendChild(acceptButton);


document.querySelector("#id_message_send_input").focus();
document.querySelector("#id_message_send_input").onkeyup = function (e) {
if (e.keyCode == 13) {
    document.querySelector("#id_message_send_button").click();
}
};
document.querySelector("#id_message_send_button").onclick = function (e) {
var messageInput = document.querySelector(
    "#id_message_send_input"
).value;
chatSocket.send(JSON.stringify({ message: messageInput, username : "{{request.user.username}}"}));
};