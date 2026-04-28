/* =========================
   ELEMENTS
========================= */

const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");

const username = document.getElementById("username");
const showUser = document.getElementById("showUser");

const messages = document.getElementById("messages");
const input = document.getElementById("input");

const chatList = document.getElementById("chatList");
const searchInput = document.querySelector(".search");

/* =========================
   STORAGE
========================= */

let chats =
  JSON.parse(
    localStorage.getItem("online_chats")
  ) || [];

let currentChatId = null;

/* =========================
   LOGIN
========================= */

function enterChat() {

  const name =
    username.value.trim() || "guest";

  localStorage.setItem(
    "online_user",
    name
  );

  showUser.innerText = name;

  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");

  initChat();
}

function logout() {

  localStorage.removeItem(
    "online_user"
  );

  location.reload();
}

window.onload = () => {

  const user =
    localStorage.getItem(
      "online_user"
    );

  if (user) {

    showUser.innerText = user;

    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");

    initChat();
  }

};

/* =========================
   INIT
========================= */

function initChat() {

  if (chats.length === 0) {
    newChat();
  } else {
    loadChat(chats[0].id);
    renderChats();
  }

}

/* =========================
   CHAT ROOM
========================= */

function newChat() {

  const id = Date.now();

  const chat = {
    id: id,
    title: "New Chat",
    messages: []
  };

  chats.unshift(chat);

  saveChats();

  loadChat(id);

  renderChats();
}

function loadChat(id) {

  currentChatId = id;

  const chat =
    chats.find(c => c.id === id);

  if (!chat) return;

  messages.innerHTML = "";

  chat.messages.forEach(msg => {
    addMessage(
      msg.text,
      msg.type,
      false
    );
  });

  renderChats();
}

function renderChats() {

  chatList.innerHTML = "";

  chats.forEach(chat => {

    const item =
      document.createElement("div");

    item.className =
      "chat-item" +
      (chat.id === currentChatId
        ? " active"
        : "");

    item.innerText = chat.title;

    item.onclick = () =>
      loadChat(chat.id);

    chatList.appendChild(item);

  });

}

function saveChats() {

  localStorage.setItem(
    "online_chats",
    JSON.stringify(chats)
  );

}

/* =========================
   MESSAGE UI
========================= */

function addMessage(
  text,
  type,
  save = true
) {

  const div =
    document.createElement("div");

  div.className =
    "msg " + type;

  div.innerText = text;

  messages.appendChild(div);

  messages.scrollTop =
    messages.scrollHeight;

  if (!save) return;

  const chat =
    chats.find(
      c => c.id === currentChatId
    );

  if (!chat) return;

  chat.messages.push({
    text,
    type
  });

  if (
    chat.title === "New Chat" &&
    type === "user"
  ) {
    chat.title =
      text.substring(0, 28);
  }

  saveChats();
  renderChats();
}

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

  const text =
    input.value.trim();

  if (!text) return;

  addMessage(text, "user");

  input.value = "";

  const typing =
    document.createElement("div");

  typing.className =
    "msg bot";

  typing.innerText =
    "online typing...";

  messages.appendChild(typing);

  messages.scrollTop =
    messages.scrollHeight;

  try {

    const res = await fetch(
      "/chat",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          message: text
        })
      }
    );

    const data =
      await res.json();

    typing.remove();

    addMessage(
      data.reply ||
        "No response.",
      "bot"
    );

  } catch (error) {

    typing.remove();

    addMessage(
      "AI belum aktif / server error.",
      "bot"
    );

    console.log(error);

  }

}

/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
  "input",
  function () {

    const key =
      this.value.toLowerCase();

    const items =
      document.querySelectorAll(
        ".chat-item"
      );

    items.forEach(item => {

      item.style.display =
        item.innerText
          .toLowerCase()
          .includes(key)
          ? "block"
          : "none";

    });

  }
);

/* =========================
   CLEAR
========================= */

function clearAllChats() {

  if (
    !confirm(
      "Delete all chats?"
    )
  ) return;

  chats = [];

  saveChats();

  newChat();
}

/* =========================
   ENTER KEY
========================= */

input.addEventListener(
  "keydown",
  function (e) {

    if (e.key === "Enter") {
      sendMessage();
    }

  }
);