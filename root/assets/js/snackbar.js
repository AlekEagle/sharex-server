(function () {
    window.help = (text) => {
        var x = document.getElementById("snackbar");
        x.innerText = text;
        x.className = "show";
        timeout = setTimeout(function () {
            x.className = x.className.replace("show", "");
        }, 7000);
    }
})();