let floaters = document.getElementsByClassName('float');
let sinkers = document.getElementsByClassName('sink');

switch (localStorage.getItem('sinkorfloat')) {
    case 'float':
        document.getElementById('strangebutton').innerText = 'We\'re floating!';
        break;
    case 'sink':
        document.getElementById('strangebutton').innerText = 'We\'re sinking!';
        for (let i = 0; floaters.length > 0; i) {
            floaters[i].classList.add('sink');
            floaters[i].classList.remove('float');
        }
        break;
}

document.getElementById('strangebutton').onclick = () => {
    switch (localStorage.getItem('sinkorfloat')) {
        case 'float':
            document.getElementById('strangebutton').innerText = 'We\'re sinking!';
            for (let i = 0; floaters.length > 0; i) {
                floaters[i].classList.add('sink');
                floaters[i].classList.remove('float');
            }
            localStorage.removeItem('sinkorfloat');
            localStorage.setItem('sinkorfloat', 'sink');
            break;
        case 'sink':
            document.getElementById('strangebutton').innerText = 'We\'re floating!';
            for (let i = 0; sinkers.length > 0; i) {
                sinkers[i].classList.add('float');
                sinkers[i].classList.remove('sink');
            }
            localStorage.removeItem('sinkorfloat');
            localStorage.setItem('sinkorfloat', 'float');
            break;
        case null: 
            document.getElementById('strangebutton').innerText = 'We\'re sinking!';
            for (let i = 0; floaters.length > 0; i) {
                floaters[i].classList.add('sink');
                floaters[i].classList.remove('float');
            }
            localStorage.removeItem('sinkorfloat');
            localStorage.setItem('sinkorfloat', 'sink');
            break;
    }
}