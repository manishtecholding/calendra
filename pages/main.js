let accessToken;
let myCal;

const widgetSelector = new bootstrap.Modal('#widgetSelector', {
    keyboard: false
});

const InitializeCalendar = () => {
    myCal = new Calendar({
        id: '#calendar',
        calendarSize: 'small',
        eventsData: [
            {
                id: 1,
                start: '2023-12-20T03:00:00',
                end: '2023-12-20T20:30:00',
                name: 'Blockchain 101'
            }
        ],
        selectedDateClicked: (currentDate, filteredMonthEvents) => {
            console.log(currentDate);
            console.log(filteredMonthEvents);
            showEventDetails(filteredMonthEvents);
        }
    });

    const handleOnClose = () => {
        console.log('handleOnClose');
    };

    const showEventDetails = (filteredMonthEvents) => {
        // event-list-body
        console.log('showEventDetails', filteredMonthEvents);

        const eventListModal = new bootstrap.Modal('#eventListModal', {
            keyboard: false,

        });

        eventListModal.show();

        const element = document.querySelector('#event-list-body');

        // Make a UL and attach it to the parent
        const eventListUl = document.createElement('ul');
        eventListUl.classList.add('menu-list');
        element.appendChild(eventListUl);

        // Make a LI element and append it to the UL

        filteredMonthEvents?.map((element, index) => {
            console.log('element', element);
            const eventListLI = document.createElement('li');
            eventListLI.classList.add('menu-item');
            eventListLI.id = element?.id;// Custom id;
            eventListLI.innerHTML = element?.name;
            eventListUl.appendChild(eventListLI);
        });

        const eventListModalById = document.getElementById('eventListModal');
        eventListModalById.addEventListener('hidden.bs.modal', (event) => {
            console.log(event);

            filteredMonthEvents = [];
            element.replaceChildren([]);
        });




    };

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const { startDate, endDate } = getStartEndDateByMonthName(
        "December",
        currentYear
    );

    chrome.runtime.sendMessage({
        getEventsByCalendarId: { startDate, endDate },
    });

    console.log(myCal);

    // Add a custom event
    // const eventData = [{
    //     id: 1,
    //     start: '2023-12-20T03:00:00',
    //     end: '2023-12-31T20:30:00',
    //     name: 'Blockchain 101'
    // }];

    // myCal.addEventsData(eventData);
};

const menuList = document.getElementById('menu-list');
menuList.addEventListener('click', (event) => {

    if (event.target.tagName === 'LI' && event.target.classList.contains('menu-item')) {
        const selectedValue = event.target.textContent;

        if (selectedValue === 'Calendar') {
            // Initialise the calendar
            InitializeCalendar();
            widgetSelector.hide();
        }
    }
});

// Recieve the message sent from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);

    message?.events.forEach((element, index) => {
        myCal.addEventsData([{
            id: element?.id,
            start: element?.start?.dateTime,
            end: element?.end?.dateTime,
            name: element?.summary
        }]);
    });
});

chrome.identity.getProfileUserInfo((result) => {
    console.log(result);

    const email = document.getElementById('user-email');
    email.innerHTML = result?.email;
    // user-email
});

console.log(myCal);



// When User clicks a month
// Caution: use .on('eventListenrer') instead of .evoCalendar('eventListener'). It resets the calendar after it is initialised
// $('#calendar').on('selectMonth', (event, activeMonth) => {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();

//     const { startDate, endDate } = getStartEndDateByMonthName(
//         activeMonth,
//         currentYear
//     );

//     chrome.runtime.sendMessage({
//         getEventsByCalendarId: { startDate, endDate },
//     });
// });

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

// chrome.storage.local.get(['access_token']).then((result) => {
//     // console.log(result);
// });

// In case of a refresh
// chrome.storage.local.get(['events']).then((result) => {
//     if (result?.events) {
//         addEvent(result?.events);
//     }
// });

// const logoutButton = document.getElementById('logout-button');

// logoutButton.addEventListener('click', (event) => {
//     chrome.storage.local.remove('access_token');

//     chrome.storage.local
//         .get(['access_token'])
//         .then((result) => {
//             if (!result.access_token) {
//                 alert('You have been logged out!');
//                 chrome.tabs.getCurrent((tab) => {
//                     chrome.tabs.remove(tab.id);
//                 });
//             }
//         })
//         .catch((error) => {
//             console.error('Error in signing in:', error);
//         });
// });


// const addEvent = async (events) => {
//     events.forEach((element, index) => {
//         if (element.status !== 'cancelled') {
//             $('#calendar').evoCalendar('addCalendarEvent', [
//                 {
//                     id: element?.id,
//                     name: element?.summary,
//                     date: element?.start?.dateTime,
//                     type: 'event',
//                 },
//             ]);
//         }
//     });
// };
