import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getDatabase, ref, set, child, update, remove, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"

$(document).ready(function () {
    $.param = function (key) {
        var result = new RegExp('[\?&]' + key + '=([^&#]*)').exec(window.location.href);
        return result != null ? result[1] : '';
    }

    //FIREBASE INITIALIZATION
    const firebaseConfig = {
        apiKey: "AIzaSyARwphqFXalQsio41sNquaWcjE3CaO0p4M", //localStorage.getItem('firebaseApiKey'),
        authDomain: "muffinmob-1ab18.firebaseapp.com",
        databaseURL: "https://muffinmob-1ab18-default-rtdb.firebaseio.com/",
        projectId: "muffinmob-1ab18",
        storageBucket: "muffinmob-1ab18.appspot.com",
        messagingSenderId: "993244819723",
        appId: "1:993244819723:web:da51498c266441a9b5b20e",
        measurementId: "G-D93PTF5P98"
    };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    const db = getDatabase();
    const dbRef = ref(getDatabase());
    //END FIREBASE INITIALIZATION 

    //POPULATE PAGE WITH BLOG POSTS
    get(child(dbRef, 'blogs')).then((snapshot) => {
        if (snapshot.exists()) {
            var list = snapshot.val();
            var listLength = (Object.keys(list).length);

            for (let i = (listLength - 1); i > -1; i--) {
                var object = Object.values(list)[i];
                var author = Object.values(object)[0];
                var content = Object.values(object)[1];
                var date = Object.values(object)[2];
                var title = Object.values(object)[3];


                $('<div>', {
                    id: 'blog-' + i,
                    class: 'blogcontainer',
                }).appendTo('.pagewrapper');

                var twitterbtn = document.createElement('a');
                twitterbtn.href = ('https://twitter.com/intent/tweet?text=Check%20out%20this%20update%20from%20%40MuffinMob!%0Ahttps://muffinmob.github.io/index.html%3fpost%3d' + i);
                twitterbtn.className = 'tweet';
                twitterbtn.innerHTML = 'Tweet';
                document.getElementById('blog-' + i).append(twitterbtn);

                $('<h1>', {
                    class: 'blogtitle',
                }).appendTo('#blog-' + i);

                $('<div>', {
                    class: 'blogmeta',
                    display: 'flex'
                }).appendTo('#blog-' + i);

                $('<div>', {
                    class: 'blogcontent',
                }).appendTo('#blog-' + i);

                $('#blog-' + i + ' .blogtitle').html(title);
                $('#blog-' + i + ' .blogmeta').html("By " + author + " | " + date);
                $('#blog-' + i + ' .blogcontent').html(content);

                if (i > 0) {
                    $('<div>', {
                        class: 'border'
                    }).appendTo('.pagewrapper');
                }
            }

            //FOCUS SPECIFIC POST IF ONE IS GIVEN
            var focusPost = $('#blog-' + $.param('post'));
            if (focusPost.length) {
                $('html, body').animate({
                    scrollTop: focusPost.offset().top,
                    scrollLeft: focusPost.offset().left
                }, 500);
            }

        } else {
            //NO BLOGS WERE FOUND
            console.log("no blogs were found!");
        }
    }).catch((error) => {
        console.error(error);
    });
}); // End of document.ready

