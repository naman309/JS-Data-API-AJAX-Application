/* STUDENT NAME: Naman Sharma
STUDENT ID: 8837689 */

"use strict";

const domain = "https://jsonplaceholder.typicode.com";
const commentsCache = new Map();

const getObject = async url => {
    const response = await fetch(url);
    const obj = response.json();
    return obj;
};

//to fetch comments 
const getComments = async postId => {
    if (commentsCache.has(postId)) { //validating and setting comment cache
        return commentsCache.get(postId);
    } else {
        const url = `${domain}/posts/${postId}/comments`;
        const comments = await getObject(url);
        commentsCache.set(postId, comments);
        return comments;
    }
};

//to display comments
const displayComments = (comments, div) => {
    let html = "<ul>";
    for (const comment of comments) {
        html += `<li>${comment.body}</li>`;
    }
    html += "</ul>";
    $(div).append(html);
};

const displayPosts = (posts, users) => {
    let html = "";
    for (const i in posts) {
        // users array was returned by Promises.allSettled()
        const username = (users[i].status == "fulfilled") ?
            users[i].value.username : "?";

        // build HTML
        html += `<h2>${posts[i].title}</h2>`;
        html += `<p>${posts[i].body}</p>`;

        html += "<div class='comments'>";
        html += `<label>Posted by ${username}</label>`;
        html += `<a href='#' data-postid='${posts[i].id}'>
            View comments</a>`;
        html += "</div>";
    }
    $("#posts").html(html);

    // add click event handler to newly created "View comments" links
    $("a").click(async evt => {
        evt.preventDefault();
        const div = evt.currentTarget.parentNode;
        const ul = div.querySelector("ul");
        if (ul) {  // comments need to be removed
            div.removeChild(ul);
        } else {     // comments need to be retrieved and displayed
            const id = evt.currentTarget.getAttribute("data-postid");
            const comments = await getComments(id);
            displayComments(comments, div);
        }
    });
};


$(document).ready(async () => {
    try {
        const posts = [
            await getObject(`${domain}/posts/2`),
            await getObject(`${domain}/posts/12`),
            await getObject(`${domain}/posts/22`),
            await getObject(`${domain}/posts/32`),
            await getObject(`${domain}/posts/42`)
        ];

        console.log(posts);

        // get user for each post
        const userPromises = posts.map(
            post => getObject(`${domain}/users/${post.userId}`)
        );
        const users = await Promise.allSettled(userPromises);

        displayPosts(posts, users);
    }
    catch (e) {
        console.log(e);
    }
});