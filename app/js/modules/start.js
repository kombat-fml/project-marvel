import MarvelData from './marvelData';
import once from './once';

const start = () => {
  const video = document.querySelector('.preloader-video'),
    preloader = document.querySelector('.preloader'),
    volume = document.querySelector('.preloader-unmute');

  const startFunction = () => {
    let marvelData = new MarvelData();
    marvelData.request();
    preloader.style.opacity = 0;
    setTimeout(() => {
      video.muted = true;
      preloader.classList.add('hidden');
    }, 800);
  };

  const startProgram = once(startFunction);

  video.addEventListener('canplaythrough', () => {
    video.setAttribute('autoplay', true);
    let promise = video.play();
    if (promise !== undefined) {
      promise
        .then((_) => {
          // Autoplay started!
        })
        .catch((error) => {
          console.error(`Ошибка воспроизведения ${error}`);
        });
    }
  });

  video.addEventListener('ended', () => {
    if (!preloader.classList.contains('hidden')) startProgram();
  });

  preloader.addEventListener('click', (event) => {
    const target = event.target;
    if (target === volume) {
      video.muted = !video.muted;
      volume.classList.toggle('unmuted');
    } else {
      startProgram();
    }
  });
  document.querySelector('body').addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'Escape' && !preloader.classList.contains('hidden')) {
      startProgram();
    }
  });
};

export default start;