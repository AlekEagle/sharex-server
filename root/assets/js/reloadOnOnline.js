(function () {
    window.addEventListener('offline', () => {
        help('You just went offline. Will reload automatically when you come back online.');
    }, false);
    window.addEventListener('online', () => {
        help('You\'re back online. Reloading..');
        setTimeout(() => {
            window.location.reload();
        }, 7000);
    }, false);
    if (!navigator.onLine) {
        help('It appears you are offline. Please try again later.')
    }
})