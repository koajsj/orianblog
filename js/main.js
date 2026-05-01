// �򵥽����ű� (����Ϊ�˺�����չ)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target && target !== '#') {
            document.querySelector(target).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
