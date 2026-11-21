const text=document.querySelector('.text')
const secretDiv = document.querySelector('.secret-div')
// Returns elements associated with CSS class

const keys = []
const secretCode = ['t', 'h', 'e', 'd', 'i', 'v', 'i', 'n', 'e', 'o', 'r', 'd', 'e', 'r', 'enter']

const confettiSettings = { target:'secret', size: 1.4, max: 150}
const confetti = new ConfettiGenerator(confettiSettings)

function keysDetector(e) {
    if (e.key.length>1 && e.key !=='Enter') return

    keys.push(e.key.toLowerCase())
    if (keys.length > secretCode.length) keys.shift()

    if (JSON.stringify(keys) === JSON.stringify(secretCode)) {
        window.removeEventListener('keyup', keysDetector)
        secretDiv.style.display = 'block'
        text.innerHTML = 'Identity Verified!'
        confetti.render()
        anime({
            targets: 'body', 
            rotate: '1turn', 
            backgroundColor: '#fcba03', 
            duration: 2000,
        })
}
    }


window.addEventListener('keyup', keysDetector)
