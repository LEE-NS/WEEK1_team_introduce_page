// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { collection, addDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getDocs, getDoc, deleteDoc, updateDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

async function setAppInfo() {
    await fetch(` https://api.github.com/orgs/ORG/actions/secrets`);
}

const firebaseConfig = {
    apiKey: "apiKey",
    authDomain: "team-introduce-page.firebaseapp.com",
    projectId: "team-introduce-page",
    storageBucket: "team-introduce-page.appspot.com",
    messagingSenderId: "812103371942",
    appId: "1:812103371942:web:710f79957dc159d322f867",
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);




/* <조원의 이름에 따라 '/' 이후에 오는 이름이 바뀌는 기능> */
/* let urlParams = new URLSearchParams(window.location.search); // URL에서 물음표(?) 이후에 오는 부분 가져오기
let referrer = urlParams.get('referrer'); // referrer 속성의 값 가져오기
let username = null; // 페이지에 따라 바뀔 이름

switch(referrer) {
    case "member1.html":
        username = "김현진";
        break;
    case "member2.html":
        username = "이녕수";
        break;
    case "member3.html":
        username = "이종훈";
        break;
    case "member4.html":
        username = "서샛별";
        break;
    case "member5.html":
        username = "남수빈";
        break;
    case "member6.html":
        username = "한효림";
        break;
}

let btn = document.getElementById("btn");
btn.textContent = " 조원 선택 / " + username; */


/* <댓글을 다는 기능> */
let writeTextarea = document.querySelector('.write .reply_textarea');
let writeBtn = document.querySelector('.write button');
let replySectionList = document.querySelector('.reply_section ul');

function replyDate() {
    let today = new Date();
    let year = today.getFullYear();
    let month = ('0' + (today.getMonth() + 1)).slice(-2);
    let day = ('0' + today.getDate()).slice(-2);
    let hours = ('0' + today.getHours()).slice(-2);
    let minutes = ('0' + today.getMinutes()).slice(-2);
    let seconds = ('0' + today.getSeconds()).slice(-2);

    let dateString = year + '.' + month + '.' + day;
    let timeString = hours + ':' + minutes + ':' + seconds;

    return {dateString, timeString};
}

writeBtn.addEventListener('click', async function() {
    if (writeTextarea.value === '') {
        alert('내용을 입력해주세요.')
        writeTextarea.focus();
        return
    }

    let dTStrings = replyDate();
    let text = writeTextarea.value;
    let date = dTStrings.dateString;
    let time = dTStrings.timeString;
    
    await addDoc(collection(db, "comment"), {
        text: text,
        date: date,
        time: time,
        timestamp: new Date(),
    });

    alert('등록되었습니다.')
    window.location.reload();
    writeTextarea.value = '';
});
// 클릭하면 input.value의 내용이 댓글란에 등록된다. 이후 input.value를 비운다. 공백인 경우 alert창이 뜬 후 input에 focus가 생긴다

let docs = await getDocs(query(collection(db, "comment"), orderBy("timestamp", "desc")));
docs.forEach((doc) => {
    let row = doc.data();
    let replyId = doc.id;
    let text = row['text']
    let date = row['date']
    let time = row['time']

    let unframedHtml = `
    <div class="texts">
        <p class="texts_reply">${text}</p>
        <textarea class="reply_textarea">${text}</textarea>
        <p class="texts_inf">
            <span>${date}</span>
            <span>${time}</span>
            <span class="reply_id">작성자 : ${replyId}</span>
            <button class="fix">수정</button>
            <button class="complete">수정 완료</button>
            <button class="delete">삭제</button>
        </p>
    </div>
    `;
    let html = `<li>${unframedHtml}</li>`

    replySectionList.innerHTML += html
});
// 입력된 텍스트를 댓글란에 표시 


async function deleteReply(target) {
    const removeTarget = target.closest("li");
    const targetIdPosition = removeTarget.querySelector(".reply_id").innerText;
    const targetId = targetIdPosition.replace(/작성자\s+:\s/, '');
    
    const userDoc = doc(db, 'comment', targetId);
    await deleteDoc(userDoc);
    alert('코멘트를 삭제합니다.')
    window.location.reload();
    
    /*
    <db 연결 전 코드>
    const removeTarget = target.closest("li");
    removeTarget.remove(); */
};

function fixReply(target) {
    let li = target.closest("li");
    const fixTextarea = li.querySelector(".reply_textarea");
    const textsReply = li.querySelector(".texts_reply");

    fixTextarea.style.display = "block";
    textsReply.style.display = "none";

    target.style.display = "none"; // "수정" 버튼 감추기
    target.nextSibling.nextSibling.style.display = "block"; // "수정 완료" 버튼 보이기
};

async function completeReply(target) {
    const textsLi = target.closest("li");
    const fixTextarea = textsLi.querySelector(".reply_textarea");
    
    const targetIdPosition = textsLi.querySelector(".reply_id").innerText;
    const targetId = targetIdPosition.replace(/작성자\s+:\s/, '');

    let dTStrings = replyDate();
    let text = fixTextarea.value;
    let date = dTStrings.dateString;
    let time = dTStrings.timeString;

    let newReply = {
        text: text,
        date: date,
        time: time,
    };

    let docRef = doc(db, "comment", targetId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
        await updateDoc(docRef, newReply)
        alert('코멘트가 수정되었습니다.')
        window.location.reload();
    } else {
        alert('해당 코멘트를 찾을 수 없습니다.')
        window.location.reload();
        return
    };

    /*
    <db 연결 전 코드> 
    let newHtml = unframedReply(fixTextarea.value);
    textsLi.innerHTML = newHtml;

    target.style.display = "none"; // "수정 완료" 버튼 감추기
    target.previousSibling.previousSibling.style.display = "block"; // "수정" 버튼 보이기 
    */
};

replySectionList.addEventListener('click', (event) => {
    const t = event.target;
    if(t.className === "delete") {
        deleteReply(t);
    } else if (t.className === "fix") {
        fixReply(t);
    } else if (t.className === "complete") {
        completeReply(t);
    }
});
