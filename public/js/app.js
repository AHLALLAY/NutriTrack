function fermerMessage(id) {
    const message = document.getElementById(id);
    if (message) {
        message.style.opacity = '0';
        setTimeout(() => {
            message.remove();
        }, 300);
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const messages = document.querySelectorAll('[id^="message-"]');
        messages.forEach(message => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 300);
        });
    }, 5000);
});

        setTimeout(() => {
            const messages = document.querySelectorAll('[id^="message-"]');
            messages.forEach(message => {
                message.style.opacity = '0';
                setTimeout(() => {
                    message.remove();
                }, 300);
            });
        }, 5000);