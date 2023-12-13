// First initlaisation
$('#calendar').evoCalendar();

// When User clicks a month
// Caution: use .on('eventListenrer') instead of .evoCalendar('eventListener'). It resets the calendar after it is initialised
$('#calendar').on('selectMonth', (event, activeMonth) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const { startDate, endDate } = getStartEndDateByMonthName(
        activeMonth,
        currentYear
    );

    chrome.runtime.sendMessage({
        getEventsByCalendarId: { startDate, endDate },
    });
});

const getStartEndDateByMonthName = (monthName, year) => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const monthIndex = months.findIndex(
        (month) => month.toLowerCase() === monthName.toLowerCase()
    );

    if (monthIndex === -1) {
        return null;
    }

    const startDate = new Date(year, monthIndex, 1).toISOString();
    const endDate = new Date(year, monthIndex + 1, 0).toISOString();

    return { startDate, endDate };
};

chrome.storage.local.get(['access_token']).then((result) => {
    // console.log(result);
});

// In case of a refresh
chrome.storage.local.get(['events']).then((result) => {
    if (result?.events) {
        addEvent(result?.events);
    }
});

const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', (event) => {
    chrome.storage.local.remove('access_token');

    chrome.storage.local
        .get(['access_token'])
        .then((result) => {
            if (!result.access_token) {
                alert('You have been logged out!');
                chrome.tabs.getCurrent((tab) => {
                    chrome.tabs.remove(tab.id);
                });
            }
        })
        .catch((error) => {
            console.error('Error in signing in:', error);
        });
});

// Recieve the message sent from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    chrome.storage.local.set({ events: message?.events });

    addEvent(message.events);
});

const addEvent = async (events) => {
    events.forEach((element, index) => {
        if (element.status !== 'cancelled') {
            $('#calendar').evoCalendar('addCalendarEvent', [
                {
                    id: element?.id,
                    name: element?.summary,
                    date: element?.start?.dateTime,
                    type: 'event',
                },
            ]);
        }
    });
};
