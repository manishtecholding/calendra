let accessToken;
let myCal;

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
            {
                id: 1,
                start: '2023-12-20T03:00:00',
                end: '2023-12-20T20:30:00',
                name: 'Blockchain 101'
            }
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
        eventListUl.appendChild(eventListLI);
    });

    const eventListModalById = document.getElementById('eventListModal');
    eventListModalById.addEventListener('hidden.bs.modal', () => {
        filteredMonthEvents = [];
        element.replaceChildren([]);
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

fetchEmail();
initWidget();
