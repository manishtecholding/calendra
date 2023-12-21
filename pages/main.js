let accessToken;
let myCal;
let userEmail;

/**
 * @description Gets Start and End Date by Month Name
 * @param {*} monthName 
 * @param {*} year 
 * @returns { startDate, endDate }
 */
const getMonthDateRange = (monthName, year) => {
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

/**
 * @description Gets Users Email
 * @returns void
 */
const fetchEmail = () => {
    chrome.identity.getProfileUserInfo((result) => {
        console.log(result);

        const email = document.getElementById('user-email');
        email.innerHTML = result?.email;
        userEmail = result?.email;
    });
};

/**
 * @description Initilise Calendar
 * @returns void
 */
const initCalendar = () => {
    myCal = new Calendar({
        id: '#calendar',
        calendarSize: 'small',
        eventsData: [
            {}
        ],
        selectedDateClicked: (currentDate, filteredMonthEvents) => {
            showEventDetails(filteredMonthEvents);
        }
    });

    initCalendarData();
};

/**
 * @description Load the initial calendar Data
 * @return void
 */
const initCalendarData = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

    const { startDate, endDate } = getMonthDateRange(
        currentMonth,
        currentYear
    );

    chrome.runtime.sendMessage({
        getEventsByCalendarId: { startDate, endDate },
    });

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
};

/**
 * @description Show the Event Details on Initial function load
 * @param {*} filteredMonthEvents 
 * @returns void
 */
const showEventDetails = (filteredMonthEvents) => {
    const eventListModal = new bootstrap.Modal('#eventListModal', {
        keyboard: false,
    });

    eventListModal.show();

    const element = document.querySelector('#event-list-body');
    element.style.display = 'block';

    // Make a UL and attach it to the parent
    const eventListUl = document.createElement('ul');
    eventListUl.classList.add('menu-list');
    element.appendChild(eventListUl);

    // Make a LI element and append it to the UL
    filteredMonthEvents?.map((element, index) => {
        const eventListLI = document.createElement('li');
        eventListLI.classList.add('menu-item');
        eventListLI.id = element?.id;// Custom id;
        eventListLI.innerHTML = element?.name;
        eventListLI.addEventListener('click', () => {
            fetchEvent(element);
        });

        eventListUl.appendChild(eventListLI);

    });

    const eventListModalById = document.getElementById('eventListModal');
    const eventDetailBody = document.getElementById('event-detail-body');
    const eventListBody = document.getElementById('event-list-body');

    eventListModalById.addEventListener('hidden.bs.modal', () => {
        console.log('hidden');
        // filteredMonthEvents = [];
        // element.replaceChildren([]);
        eventDetailBody.replaceChildren([]);
        eventListBody.replaceChildren([]);
    });

};

/**
 * @description Initialise Widget Selector with data
 * @returns void
 */
const initWidget = () => {
    // Initialise the widget Selector Modal
    const widgetSelector = new bootstrap.Modal('#widgetSelector', {
        keyboard: false
    });

    // Show the options in widget Selector Modal
    const menuList = document.getElementById('menu-list');
    menuList.addEventListener('click', (event) => {

        if (event.target.tagName === 'LI' && event.target.classList.contains('menu-item')) {
            const selectedValue = event.target.textContent;

            if (selectedValue === 'Calendar') {
                // Initiliase the calendar if user selects the calendar widget
                initCalendar();
                widgetSelector.hide();
            }
        }
    });
};

const element = document.getElementsByClassName('menu-item');
console.log(element);

// https://google-calendar-brown.vercel.app
// {{URL}}/calendars/manish.pamnani@techholding.co/events/3hl2bei35fv3l28vsucs2e9v1i_20231212T093000Z
const fetchEvent = async (event) => {
    console.log(event);
    // console.log(userEmail);

    // console.log(accessToken);
    // console.log(access_token);
    // console.log(options);

    try {
        let options = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };

        await fetch(`https://google-calendar-brown.vercel.app/calendars/${userEmail}/events/${event?.id}`, options).then((res) => res.json())
            .then((result) => {
                console.log(result?.data);

                // Hide the Event List body and show the Event Details body(with content)
                const element = document.getElementById('event-list-body');
                element.style.display = 'none';

                const eventDetailBody = document.getElementById('event-detail-body');

                const title = document.createElement('span');
                title.classList.add('event-list-item');
                title.id = 'event-title';
                title.innerHTML = event?.name;

                const time = document.createElement('span');
                time.classList.add('event-list-item');
                time.innerHTML = result?.data?.start?.dateTime + ' ' + result?.data?.end?.dateTime;

                const joinButton = document.createElement('span');
                joinButton.classList.add('event-list-item');
                joinButton.innerHTML = `<a href="${result?.data?.hangoutLink}" target="_blank">Join with Google Meet</a>`;

                const summary = document.createElement('span');
                summary.classList.add('event-list-item');
                summary.innerHTML = result?.data?.summary;

                eventDetailBody.appendChild(title);
                eventDetailBody?.appendChild(time);
                eventDetailBody?.appendChild(joinButton);
                eventDetailBody?.appendChild(summary);




            })
            .catch((error) => console.error('Error in fetching Event details: ', error));
    } catch (error) {
        console.error('Error in fetching Event Details: ', error);
    }
};

const fetchAccessToken = () => {
    console.log('fetchAccessToken');

    chrome.storage.local.get(['access_token']).then((result) => {
        accessToken = result?.access_token;
        console.log(accessToken);
    }).catch((error) => console.error('Error in fetching access_token: ', error));

};

fetchEmail();
initWidget();
fetchAccessToken();