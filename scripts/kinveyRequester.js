const KinveyRequester = (function() {
    const baseUrl = "https://baas.kinvey.com/";
    const appKey = "kid_ByH35AYXx";
    const appSecret = "9fe99e0a1f984a2794f7f40906e6f57f";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " + btoa(appKey + ":" + appSecret),
    };
    const collection = 'messages';


    function loginUser(username, password) {
        return $.ajax({
            method: "POST",
            url: baseUrl + "user/" + appKey + "/login",
            headers: kinveyAppAuthHeaders,
            data: { username, password }
        });
    }

    function registerUser(username, name, password) {
        return $.ajax({
            method: "POST",
            url: baseUrl + "user/" + appKey + "/",
            headers: kinveyAppAuthHeaders,
            data: { username, name, password }
        });
    }

    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };
    }

    function logoutUser() {
        return $.ajax({
            method: "POST",
            url: baseUrl + "user/" + appKey + "/_logout",
            headers: getKinveyUserAuthHeaders(),
        });
    }

    function findAllUsers() {
        return $.ajax({
            method: "GET",
            url: baseUrl + "user/" + appKey,
            headers: getKinveyUserAuthHeaders()
        });
    }

    function findAllEntities() {
        return $.ajax({
            method: "GET",
            url: baseUrl + "appdata/" + appKey + "/" + collection,
            headers: getKinveyUserAuthHeaders()
        });
    }

    function findEntityById(entity) {
        return $.ajax({
            method: "GET",
            url: baseUrl + "appdata/" + appKey + "/" + collection + "/" + entity._id,
            headers: getKinveyUserAuthHeaders()
        });
    }

    function createEntity(senderUsername, senderName, recipientUsername, messageText) {
        return $.ajax({
            method: "POST",
            url: baseUrl + "appdata/" + appKey + "/" + collection,
            headers: getKinveyUserAuthHeaders(),
            data: { sender_username: senderUsername, sender_name: senderName, recipient_username: recipientUsername, text: messageText }
        });
    }

    function editEntity(entityId, title, body, author, date) {
        return $.ajax({
            method: "PUT",
            url: baseUrl + "appdata/" + appKey + "/" + collection + "/" + entityId,
            headers: getKinveyUserAuthHeaders(),
            data: { title, body, author, date }
        });
    }

    function deleteEntity(entity) {
        return $.ajax({
            method: "DELETE",
            url: baseUrl + "appdata/" + appKey + "/" + collection + "/" + entity._id,
            headers: getKinveyUserAuthHeaders()
        });
    }

    return {
        loginUser, registerUser, logoutUser, findAllUsers,
        findAllEntities, createEntity, findEntityById, editEntity, deleteEntity
    }
})();