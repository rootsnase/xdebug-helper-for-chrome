(function () {
	
	const sIDE = 'ide';
	/**
	 * string constant
	 * @type {string}
	 */
	const sIDEKEY = 'idekey';
	/**
	 * string constant
	 * @type {string}
	 */
	const sTRACETRIGGER = 'tracetrigger';
	/**
	 * string constant
	 * @type {string}
	 */
	const sPROFILETRIGGER = 'profiletrigger';
	
	const sDISABLE_POPUP = 'disable-popup';
	// setTimeout() return value
	let disablePopupTimeout;
	
	/**
	 * getElementById
	 * @param name
	 * @returns {HTMLElement}
	 */
	const getEle = name => document.getElementById(name);
	/**
	 * getValue ElementById
	 * @param name
	 * @returns {*}
	 */
	const getEleVal = name => getEle(name).value;
	/**
	 *
	 */
	const saveOptions = () => {
		
		localStorage['xdebugIdeKey'] = getEleVal(sIDEKEY);
		localStorage['xdebugTraceTrigger'] = getEleVal(sTRACETRIGGER);
		localStorage['xdebugProfileTrigger'] = getEleVal(sPROFILETRIGGER);
		
		localStorage.xdebugDisablePopup = getEle(sDISABLE_POPUP).checked ?
			'1' :
			'0';
	};
	/**
	 *
	 */
	const restoreOptions = () => {
		// Restore IDE Key
		const idekey = localStorage['xdebugIdeKey'] || 'XDEBUG_ECLIPSE';
		
		const ideE = getEle(sIDE);
		const idekeyE = getEle(sIDEKEY);
		
		if ('XDEBUG_ECLIPSE' === idekey || 'netbeans-xdebug' === idekey || 'macgdbp' === idekey || 'PHPSTORM' === idekey) {
			ideE.value = idekey;
			idekeyE.setAttribute('disabled', 'true');
			
		} else {
			ideE.value = 'null';
			idekeyE.removeAttribute('disabled');
		}
		idekeyE.value = idekey;
		
		// Restore Trace Triggers
		
		getEle(sTRACETRIGGER).value = localStorage['xdebugTraceTrigger'] !== undefined ?
			localStorage['xdebugTraceTrigger'] :
			null;
		
		// Restore Profile Triggers
		getEle(sPROFILETRIGGER).value = localStorage['xdebugProfileTrigger'] !== undefined ?
			localStorage['xdebugTraceTrigger'] :
			null;
		
		// Restore Disable Popup
		getEle(sDISABLE_POPUP).checked = ('1' === localStorage.xdebugDisablePopup);
	};
	
	/**
	 * Disable Popup checkbox changed, persist it.
	 */
	const disablePopupChanged = () => {
		const disablePopupSaved = document.getElementsByClassName('disable-popup-saved')[0].classList;
		
		disablePopupSaved.add('show');
		
		// First clear interval
		clearInterval(disablePopupTimeout);
		// Hide after 2 seconds
		disablePopupTimeout = setTimeout(() => disablePopupSaved.remove('show'), 2000);
		
		// Persist
		saveOptions();
		
		// We need to reload the extension, because to hide the popup
		chrome.extension.getBackgroundPage().window.location.reload();
	};
	
	const init = () => {
		const ideE = getEle(sIDE);
		const idekeyE = getEle(sIDEKEY);
		
		ideE.addEventListener('change', () => {
			
			if (ideE.value) {
				
				idekeyE.setAttribute('disabled', 'true');
				idekeyE.value = ideE.value;
				
				saveOptions();
			} else {
				idekeyE.removeAttribute('disabled');
			}
		});
		idekeyE.addEventListener('change', saveOptions);
		
		// Persist Disable Popup on onChange event
		getEle(sDISABLE_POPUP).addEventListener('change', disablePopupChanged);
		attachSaveBtns();
		restoreOptions();
	};
	
	const attachSaveBtns = () => {
		
		[].forEach.call(document.getElementsByClassName('save-button'), ele => {
			ele.addEventListener('click', saveOptions);
		});
		
		
		
	};
	
	// init loader
	window.addEventListener('DOMContentLoaded', init);
})();