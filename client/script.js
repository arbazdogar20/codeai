import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// Loader
function loader(el) {
  el.textContent = '';
  loadInterval = setInterval(() => {
    el.textContent += '.';

    if (el.textContent === '....') {
      el.textContent = '';
    }
  }, 300);
}

// Typing...
function typeText(el, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// Generate Unique Key
function generateID() {
  const timeStamp = Date.now();
  const rand = Math.random();
  const uuid = crypto.randomUUID();
  return `id-${timeStamp}-${rand}-${uuid}`;
}

// chat stripe
function chatStripe(isAI, value, uniqueID) {
  return `
    <div class="wrapper ${isAI && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAI ? bot : user}" alt=${isAI ? 'bot' : 'user'} />
        </div>
        <div class="message" id=${uniqueID}>${value}</div>
      </div>
    </div>
    `;
}

// Submit
const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  // user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  // bot chatStripe
  const uniqueID = generateID();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueID);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);
  loader(messageDiv);

  // fetch data from server => bot response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';
  if (response.ok) {
    const data = await response.json();
    const parse = data.bot.trim();

    typeText(messageDiv, parse);
  } else {
    const err = await response.text;
    messageDiv.innerHTML = 'Somthing Went Wrong';
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
