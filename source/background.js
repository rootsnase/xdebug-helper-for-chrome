chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	// We only react on a complete load of a http(s) page,
	//  only then we're sure the content.js is loaded.
	if ('complete' !== changeInfo.status || 0 !== tab.url.indexOf('http')) {
		return;
	}
	
	// Prep some variables
	var ideKey = 'XDEBUG_ECLIPSE', match = true, traceTrigger = ideKey,
		profileTrigger = ideKey, domain;
	
	// Check if localStorage is available and get the settings out of it
	if (localStorage) {
		if (localStorage['xdebugIdeKey']) {
			ideKey = localStorage['xdebugIdeKey'];
		}
		
		if (localStorage['xdebugTraceTrigger']) {
			traceTrigger = localStorage['xdebugTraceTrigger'];
		}
		
		if (localStorage['xdebugProfileTrigger']) {
			profileTrigger = localStorage['xdebugProfileTrigger'];
		}
	}
	
	// Request the current status and update the icon accordingly
	chrome.tabs.sendMessage(tabId, {
		cmd: 'getStatus', idekey: ideKey, traceTrigger: traceTrigger, profileTrigger: profileTrigger
	}, function (response) {
		if (chrome.runtime.lastError) {
			console.log('Error: ', chrome.runtime.lastError);
			return;
		}
		
		// Update the icon
		updateIcon(response.status, tabId);
	});
});

chrome.commands.onCommand.addListener(function (command) {
	if ('toggle_debug_action' === command) {
		var ideKey = 'XDEBUG_ECLIPSE';
		var traceTrigger = ideKey;
		var profileTrigger = ideKey;
		
		// Check if localStorage is available and get the settings out of it
		if (localStorage) {
			if (localStorage['xdebugIdeKey']) {
				ideKey = localStorage['xdebugIdeKey'];
			}
			
			if (localStorage['xdebugTraceTrigger']) {
				traceTrigger = localStorage['xdebugTraceTrigger'];
			}
			
			if (localStorage['xdebugProfileTrigger']) {
				profileTrigger = localStorage['xdebugProfileTrigger'];
			}
		}
		
		// Fetch the active tab
		chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT}, function (tabs) {
			// Do nothing when there is no active tab atm
			if (0 === tabs.length) {
				return;
			}
			
			// Get the current state
			chrome.tabs.sendMessage(tabs[0].id, {
				cmd: 'getStatus', idekey: ideKey, traceTrigger: traceTrigger, profileTrigger: profileTrigger
			}, function (response) {
				// Get new status by current status
				const newStatus = getNewStatus(response.status);
				
				chrome.tabs.sendMessage(tabs[0].id, {
					cmd: 'setStatus', status: newStatus, idekey: ideKey, traceTrigger: traceTrigger, profileTrigger: profileTrigger
				}, function (response) {
					// Update the icon
					updateIcon(response.status, tabs[0].id);
				});
			});
		});
	}
});

// Will not be called, if popup is disabled, so not needed to wrap this in a if statement
chrome.browserAction.onClicked.addListener((tab) => {
	var ideKey = 'XDEBUG_ECLIPSE';
	var traceTrigger = ideKey;
	var profileTrigger = ideKey;
	
	// Check if localStorage is available and get the settings out of it
	if (localStorage) {
		if (localStorage['xdebugIdeKey']) {
			ideKey = localStorage['xdebugIdeKey'];
		}
		
		if (localStorage['xdebugTraceTrigger']) {
			traceTrigger = localStorage['xdebugTraceTrigger'];
		}
		
		if (localStorage['xdebugProfileTrigger']) {
			profileTrigger = localStorage['xdebugProfileTrigger'];
		}
	}
	
	// Get the current state
	chrome.tabs.sendMessage(tab.id, {
		cmd: 'getStatus', idekey: ideKey, traceTrigger: traceTrigger, profileTrigger: profileTrigger
	}, function (response) {
		// Get new status by current status
		const newStatus = getNewStatus(response.status);
		
		chrome.tabs.sendMessage(tab.id, {
			cmd: 'setStatus', status: newStatus, idekey: ideKey, traceTrigger: traceTrigger, profileTrigger: profileTrigger
		}, function (response) {
			// Update the icon
			updateIcon(response.status, tab.id);
		});
	});
});

/**
 * Get new status by current status.
 *
 * @param {number} status - Current status from sendMessage() cmd: 'getStatus'.
 *
 * @returns {number}
 */
function getNewStatus(status) {
	// Reset status, when trace or profile is selected and popup is disabled
	if (('1' === localStorage.xdebugDisablePopup) && ((2 === status) || (3 === status))) {
		return 0;
	}
	
	// If state is debugging (1) toggle to disabled (0), else toggle to debugging
	return (1 === status) ? 0 : 1;
}

function updateIcon(status, tabId) {
	// Reset status, when trace or profile is selected and popup is disabled
	
	if (('1' === localStorage.xdebugDisablePopup) && ((2 === status) || (3 === status))) {
		status = 0;
	}
	
	// Figure the correct title / image by the given state
	let image = 'images/bug-gray.png';
	let title = ('1' === localStorage.xdebugDisablePopup) ?
		'Debugging disabled' :
		'Debugging, profiling & tracing disabled';
	
	status = parseInt(status);
	
	if (1 === status) {
		title = 'Debugging enabled';
		image = 'images/bug.png';
	} else if (2 === status) {
		title = 'Profiling enabled';
		image = 'images/clock.png';
	} else if (3 === status) {
		title = 'Tracing enabled';
		image = 'images/script.png';
	}
	
	// Update title
	chrome.browserAction.setTitle({
		tabId: tabId, title: title
	});
	
	// Update image
	chrome.browserAction.setIcon({
		tabId: tabId, path: image
	});
}

/**
 * @deprecated
 * @todo to remove silver
 */
function isValueInArray(arr, val) {
	for (i = 0; i < arr.length; i++) {
		var re = new RegExp(arr[i], 'gi');
		if (re.test(val)) {
			return true;
		}
	}
	
	return false;
}

// Disable / Enable Popup by localStorage
if ('1' === localStorage.xdebugDisablePopup) {
	chrome.browserAction.setPopup({
		popup: ''
	});
} else {
	chrome.browserAction.setPopup({
		popup: 'popup.html'
	});
}