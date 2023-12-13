let access_token;
let email;
let events;

function formatDate(date) {
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

const currentDate = new Date();

const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
);
const startDate = formatDate(startOfMonth);

const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
);
const endDate = formatDate(endOfMonth);

function clearToken() {
    chrome.storage.local.remove('access_token');

    chrome.storage.local
        .get(['access_token'])
        .then((result) => {})
        .catch((error) => {
            console.error('Error in signing in', error);
        });
}

chrome.runtime.onInstalled.addListener((details) => {
    clearToken();
});

// chrome.windows.onRemoved.addListener(() => {
//     clearToken();
// });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const urlParams = new URLSearchParams(changeInfo?.url);
    for (const [key, value] of urlParams) {
        if (key.includes('access_token')) {
            access_token = value;
            chrome.storage.local
                .set({ access_token })
                .then(() => {
                    redirectToHomePage(tabId);
                    getEventsByCalendarId(email);
                })
                .catch((error) => {
                    console.error('error in closing the tab', error);
                });
        }
    }
});

function redirectToHomePage(tabId) {
    const localPageURL = chrome.runtime.getURL('./pages/index.html');

    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            chrome.tabs.update(currentTab.id, { url: localPageURL });
        }
    });
}

chrome.identity?.getProfileUserInfo((info) => {
    email = info?.email;
});

const getEventsByCalendarId = async (email, start, end) => {
    try {
        let options = {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        };

        await fetch(
            `https://google-calendar-brown.vercel.app/calendars/${email}/events?startDate=${start}&endDate=${end}`,
            options
        )
            .then((res) => res.json())
            .then((result) => {
                chrome.runtime.sendMessage({ events: result?.data?.items });
            })
            .catch((error) =>
                console.error('Error in fetching calendars: ', error)
            );
    } catch (error) {
        console.error('Error in getting calendar: ', error);
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (Object.keys(message)[0] === 'getEventsByCalendarId') {
        const { startDate, endDate } = Object.values(message)[0];

        getEventsByCalendarId(email, startDate, endDate);
    }
});
