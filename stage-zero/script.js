const currentTime = document.getElementById('localTime')

currentTime.textContent = new Date().toUTCString()
