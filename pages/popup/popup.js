const signInButton = document.getElementById('signInButton');
const success = document.getElementById('success');
const welcomeMessage = document.querySelector('.welcome-message');

signInButton.addEventListener('click', () => {
    handleLogin();
});

async function handleLogin() {
    chrome.tabs.create({
        url: 'https://google-calendar-brown.vercel.app/authorise',
    });
}

chrome.storage.local
    .get(['access_token'])
    .then((result) => {
        if (result?.access_token) {
            signInButton.style.display = 'none';
            success.style.display = 'block';
            welcomeMessage.style.display = 'none';
        } else {
            signInButton.style.display = 'flex';
            success.style.display = 'none';
            welcomeMessage.style.display = 'block';
        }
    })
    .catch((error) => {
        console.error('Error in signing in', error);
    });
