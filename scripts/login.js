import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-auth.js";
import { getDatabase, ref, set, child, update, remove, get } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-database.js"

$('#login').on('click', function () {
    login();
});

//FIREBASE INITIALIZATION
const firebaseConfig = {
    apiKey: "AIzaSyARwphqFXalQsio41sNquaWcjE3CaO0p4M",
    authDomain: "muffinmob-1ab18.firebaseapp.com",
    databaseURL: "https://muffinmob-1ab18-default-rtdb.firebaseio.com/",
    projectId: "muffinmob-1ab18",
    storageBucket: "muffinmob-1ab18.appspot.com",
    messagingSenderId: "993244819723",
    appId: "1:993244819723:web:da51498c266441a9b5b20e",
    measurementId: "G-D93PTF5P98"
};

//init firebase
const app = initializeApp(firebaseConfig);

//init variables
const auth = getAuth(app);
const db = getDatabase();
const dbRef = ref(getDatabase());
var user;

$('.loginbtn').click(function () { login(); });
tryResignUser();

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
    } else {
        //do nothing
    }
})
function tryResignUser() {
    if (localStorage.getItem('email') && localStorage.getItem('password')) {
        $("#email").val(localStorage.getItem('email'));
        $("#password").val(localStorage.getItem('password'));
        login();
    }
}

function login() {
    localStorage.setItem('email', $('#email').val());
    localStorage.setItem('password', $('#password').val());
    email = document.getElementById('email').value;
    password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        user = userCredential.user;
        $('#login-form').hide();
        get(child(dbRef, 'blogs')).then((snapshot) => {
            if (snapshot.exists()) {
                var list = snapshot.val();
                var listLength = (Object.keys(list).length);

                $('<div>', {
                    id: "adminExistingContainer"
                }).appendTo(".pagewrapper");

                $('<div>', {
                    id: "adminPostContainer"
                }).appendTo(".pagewrapper");

                $('<input type="text" id="tinymce-title" placeholder="Post Title"></input>').appendTo("#adminPostContainer");
                $('<textarea id="tinymce"></textarea>').appendTo("#adminPostContainer");
                $('<button class="btn addbtn">Add</button>').appendTo("#adminPostContainer");
                $('.addbtn').click(function () { addBlog(); });
                $('head').append($.getScript("/scripts/tinymce/initializetinymce.js"));

                for (let i = 0; i < listLength; i++) {
                    var object = Object.values(list)[i];
                    var date = Object.values(object)[2];
                    var title = Object.values(object)[3];

                    $('<div>', {
                        id: ("blog-" + i),
                        class: "blog-container"
                    }).appendTo("#adminExistingContainer");

                    $('#blog-' + i).html("<h2>" + title + "</h2><p>" + date + "</p>");

                    $('<button id="delete-' + i + '" class="btn">Delete</button>').appendTo("#blog-" + i);
                    $('#delete-' + i).click(function () { deleteBlog(Object.keys(list)[i], title); });

                    $('<button id="edit-' + i + '"class="btn">Edit</button>').appendTo("#blog-" + i);
                    $('#edit-' + i).click(function () { editBlog(Object.keys(list)[i]); });
                }
            } else {
                //no blogs were found.
                $(".pagewrapper").html('<h2 style="color:white;">No blogs currently exist</h2>')
                $('<button class="btn firstpostbtn">Create a post</button>').appendTo(".pagewrapper");
                $('.firstpostbtn').click(function () {
                    $('.pagewrapper').html('');
                    $('<div>', {
                        id: "adminPostContainer"
                    }).appendTo(".pagewrapper");
                    $('<input type="text" id="tinymce-title" placeholder="Post Title"></input>').appendTo("#adminPostContainer");
                    $('<textarea id="tinymce"></textarea>').appendTo("#adminPostContainer");
                    $('<button class="btn addbtn">Add</button>').appendTo("#adminPostContainer");
                    $('.addbtn').click(function () { addBlog(); });
                    $('head').append($.getScript("/scripts/tinymce/initializetinymce.js"));
                });
            }
        }).catch((error) => {
            console.error(error);
        });

    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        window.location.href = "../../index.html";
    });
}

function newBlog() {
    $('.newbtn').remove();
    $('.updatebtn').remove();
    $('.editmessage').remove();
    $('#tinymce-title').val('');
    tinymce.activeEditor.setContent('');

    $('<button class="btn addbtn">Add</button>').appendTo("#adminPostContainer");
    $('.addbtn').click(function () { addBlog(); });

}

function addBlog() {
    var now = new Date();
    var date = now.toLocaleString('en-US', {
        timeZone: 'America/New_York'
    });

    var title = $("#tinymce-title").val();
    var content = tinymce.activeEditor.getContent();

    var id = ('blog-' + (now.getMonth() + 1) + '' + now.getDate() + '' + now.getFullYear() + '' + now.getHours() + '' + now.getMinutes() + '' + now.getSeconds() + '' + now.getMilliseconds());

    if (title.length > 0 && id.length > 0 && content.length > 0 && user.displayName.length > 0) {
        set(ref(db, '/blogs/' + id), {
            "author": user.displayName,
            "content": content,
            "date": date,
            "title": title
        });
        alert('"' + title + '" was added to the database!');
        window.location.reload();
    } else {
        //not all of the required fields are here.
        alert("Please ensure that all of the required fields are filled, and try again.");
    }
}

function updateBlog(name) {
    var title = $("#tinymce-title").val();
    var content = tinymce.activeEditor.getContent();

    if (name.length > 0 && title.length > 0 && content.length > 0) {
        update(ref(db, '/blogs/' + name), {
            "content": content,
            "title": title
        });
        alert('"' + name + '" was updated!');
        window.location.reload();
    } else {
        //not all of the required fields are here.
        alert("Please ensure that all of the required fields are filled, and try again.");
    }
}

function deleteBlog(name, title) {
    if (window.confirm('Are you sure you want to delete "' + title + '"?\nThis cannot be undone.')) {
        remove(ref(db, ('/blogs/' + name)));
        window.location.reload();
    }
}

function editBlog(name) {
    get(child(dbRef, 'blogs')).then((snapshot) => {
        var list = snapshot.val();
        var objects = Object.keys(list);
        var object = Object.values(list)[objects.indexOf(name)];

        if (object) {
            var content = Object.values(object)[1];
            var title = Object.values(object)[3];
            $('#tinymce-title').val(title)
            tinymce.activeEditor.setContent(content);

            $('.addbtn').remove();
            $('.newbtn').remove();
            $('.updatebtn').remove();
            $('.editmessage').remove();
            $('<p class="editmessage"><b>Now Editing: </b>"' + title + '"</p>').prependTo('#adminPostContainer');
            $('<button class="btn updatebtn">Update</button>').appendTo("#adminPostContainer");
            $('.updatebtn').click(function () { updateBlog(name); });
            $('<button class="btn newbtn" style="width:150px;position:absolute;top:0;left:100%;margin-left:-160px;">Create a new post</button>').appendTo("#adminPostContainer");
            $('.newbtn').click(function () { newBlog(); });
        } else {
            alert('Could not find a post with that index. Please try again.');
            window.location.reload();
        }

    }).catch((error) => {
        console.error(error);
    });

}

function validateField(field) {
    if (field == null || field.length <= 0) {
        return false;
    } else {
        return true;
    }
}
