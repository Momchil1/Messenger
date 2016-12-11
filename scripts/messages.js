function startApp() {
    sessionStorage.clear();
    $('#infoBox, #errorBox, #loadingBox').css('display', 'none');
    $('#spanMenuLoggedInUser').text("");
    showHideMenuLinks();
    showView('viewAppHome');

    // Show or hide the links in the navigation bar
    function showHideMenuLinks() {
        if (sessionStorage.getItem('authToken')) {
            // logged in user
            $("#linkMenuAppHome").hide();
            $("#linkMenuLogin").hide();
            $("#linkMenuRegister").hide();
            $("#linkMenuUserHome").show();
            $("#linkMenuMyMessages").show();
            $("#linkMenuArchiveSent").show();
            $("#linkMenuSendMessage").show();
            $("#linkMenuLogout").show();

        } else {
            // No logged in user
            $("#linkMenuAppHome").show();
            $("#linkMenuLogin").show();
            $("#linkMenuRegister").show();
            $("#linkMenuUserHome").hide();
            $("#linkMenuMyMessages").hide();
            $("#linkMenuArchiveSent").hide();
            $("#linkMenuSendMessage").hide();
            $("#linkMenuLogout").hide();
        }
    }

    // Hide all views and show the selected view only
    function showView(viewName) {
        $('main > section').hide();
        $('#' + viewName).show();
    }

    // Bind the info / error boxes: hide on click
    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });

    // Bind the navigation menu links
    $("#linkMenuAppHome").click(showHomeView);
    $("#linkMenuLogin").click(showLoginView);
    $("#linkMenuRegister").click(showRegisterView);
    $("#linkMenuUserHome").click(showUserHomeView);
    $("#linkMenuMyMessages").click(showMyMessagesView);
    $("#linkMenuArchiveSent").click(showArchiveView);
    $("#linkMenuSendMessage").click(showSendMessageView);
    $("#linkMenuLogout").click(logout);

    $("#linkUserHomeMyMessages").click(showMyMessagesView);
    $("#linkUserHomeArchiveSent").click(showArchiveView);
    $("#linkUserHomeSendMessage").click(showSendMessageView);

    // Bind the submit buttons
    $("#formLogin").submit(login);
    $("#formRegister").submit(register);
    $("#formSendMessage input[value=Send]").click(sendMessage);

    //-----Views----------------------------------------------------------------------//

    // No logged in user links
    function showHomeView() {
        showView('viewAppHome');
    }
    //---------------------------
    function showLoginView() {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }
    //----------------------------
    function showRegisterView() {
        showView('viewRegister');
        $('#formRegister').trigger('reset');
    }

    // Logged in user links
    function showUserHomeView() {
        showView('viewUserHome');
    }
    //---------------------------
    function showMyMessagesView() {
        $('#myMessages').empty();
        showView('viewMyMessages');
        KinveyRequester.findAllEntities()
            .then(loadSuccess)
            .catch(handleAjaxError);
        function loadSuccess(response) {
            showInfo('Messages loaded.');
            if (response.length == 0) {
                $('#myMessages').text('The collection is empty.');
            }
            else {
                let table = $('<table>')
                    .append($('<tr>').append(
                        '<th>From</th><th>Message</th><th>Date Received</th>'));
                for (let entity of response) {

                    if (entity.recipient_username  == sessionStorage['username']) {
                        table.append($('<tr>').append(
                            $('<td>').text(formatSender(entity.sender_name, entity.sender_username)),
                            $('<td>').text(entity.text),
                            $('<td>').text(formatDate(entity._kmd.lmt))
                        ));
                    }
                }
                $('#myMessages').append(table);
            }
        }
        function formatDate(dateISO8601) {
            let date = new Date(dateISO8601);
            if (Number.isNaN(date.getDate()))
                return '';
            return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
                "." + date.getFullYear() + ' ' + date.getHours() + ':' +
                padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

            function padZeros(num) {
                return ('0' + num).slice(-2);
            }
        }
        function formatSender(name, username) {
            if (!name)
                return username;
            else
                return username + ' (' + name + ')';
        }
    }
    //------------------------------------------------

    function showArchiveView() {
        $('#sentMessages').empty();
        showView('viewArchiveSent');
        KinveyRequester.findAllEntities()
            .then(loadSuccess)
            .catch(handleAjaxError);
        function loadSuccess(response) {
            showInfo('Messages loaded.');
            if (response.length == 0) {
                $('#sentMessages').text('The collection is empty.');
            }
            else {
                let table = $('<table>')
                    .append($('<tr>').append(
                        '<th>To</th><th>Message</th><th>Date Received</th><th>Actions</th>'));
                for (let entity of response) {

                    if (entity.sender_username  == sessionStorage['username']) {
                        let deleteLink = $('<button>Delete</button>')
                            .click(function () {
                                deleteIt(entity)
                            });

                        table.append($('<tr>').append(
                            $('<td>').text(entity.recipient_username),
                            $('<td>').text(entity.text),
                            $('<td>').text(formatDate(entity._kmd.lmt)),
                            $('<td>').append(deleteLink)
                        ));
                    }
                }
                $('#sentMessages').append(table);
            }
        }
        function formatDate(dateISO8601) {
            let date = new Date(dateISO8601);
            if (Number.isNaN(date.getDate()))
                return '';
            return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
                "." + date.getFullYear() + ' ' + date.getHours() + ':' +
                padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

            function padZeros(num) {
                return ('0' + num).slice(-2);
            }
        }
    }
    //-----------------------------------------
    function showSendMessageView() {
        $('#msgRecipientUsername').empty();
        $('#formSendMessage input[name=text]').val('');
        showView('viewSendMessage');

        KinveyRequester.findAllUsers()
            .then(findUsersSuccess)
            .catch(handleAjaxError);

        function findUsersSuccess(users) {
            for (let user of users){
                let option = $('<option>').val(user.username);
                let optionText = option.text(formatSender(user.name, user.username));
                $('#msgRecipientUsername').append(optionText);
            }
        }

        function formatSender(name, username) {
            if (!name)
                return username;
            else
                return username + ' (' + name + ')';
        }
    }

    //-----Actions without a view------------------------------------------------------//

    function logout() {
        KinveyRequester.logoutUser()
            .then(logoutSuccess)
            .catch(handleAjaxError);
        function logoutSuccess() {
            sessionStorage.clear();
            $('#spanMenuLoggedInUser').text("");
            showHideMenuLinks();
            showView('viewAppHome');
            showInfo('Logout successful.');
        }
    }
    function deleteIt(entity) {
        KinveyRequester.deleteEntity(entity)
            .then(deleteSuccess)
            .catch(handleAjaxError);
        function deleteSuccess() {
            showArchiveView();
            showInfo('Message deleted.');
        }
    }

    //-----Input forms-----------------------------------------------------------------//

    function register() {
        event.preventDefault();
        let username = $('#formRegister input[name=username]').val();
        let password = $('#formRegister input[name=password]').val();
        let name = $('#formRegister input[name=name]').val();
        KinveyRequester.registerUser(username, name, password)
            .then(registerSuccess)
            .catch(handleAjaxError);

        function registerSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            showUserHomeView();
            showInfo('User registration successful.');
        }
    }

    function login() {
        event.preventDefault();
        let username = $('#formLogin input[name=username]').val();
        let password = $('#formLogin input[name=password]').val();
        KinveyRequester.loginUser(username, password)
            .then(loginSuccess)
            .catch(handleAjaxError);

        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            showUserHomeView();
            showInfo('Login successful.');
        }
    }

    function sendMessage() {
        event.preventDefault();
        let recipientUsername = $("#msgRecipientUsername option:selected").val();
        let messageText = $("#formSendMessage input[name=text]").val();
        let senderUsername = sessionStorage.username;
        let senderName = sessionStorage.name;

        KinveyRequester.createEntity(senderUsername, senderName, recipientUsername, messageText)
            .then(sendSuccess)
            .catch(handleAjaxError);

        function sendSuccess() {
            showArchiveView();
            showInfo('Message sent.');
        }
    }

    //-----Save data in sessionStorage--------------------------------------------------//

    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userID', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
        let name = userInfo.name;
        sessionStorage.setItem('name', name);
        $('#spanMenuLoggedInUser').text("Welcome, " + username + "!");
        $('#viewUserHomeHeading').text("Welcome, " + username + "!");
    }

    //-----Error and information messages--------------------------------------------------//

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function() {
            $('#infoBox').fadeOut();
        }, 3000);
    }
    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON &&
            response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        showError(errorMsg);
    }
    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }
}