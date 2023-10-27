// import Navigo from 'navigo';

const API_KEY = 'AIzaSyBRGf0v3Aa62NW4QmpjR3NbHSqVjfTHFn4';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const router = new Navigo('/', { hash: true });

const main = document.querySelector('main');

const favoriteIds = JSON.parse(localStorage.getItem('favoriteYT') || '[]')

const preload = {
    elem: document.createElement('div'),
    text: '<p class="preload__text">Загрузка...</p>',
    append() {
        main.style.display = "flex";
        main.append(this.elem)
    },
    remove() {
        main.style.display = "";
        this.elem.remove()
    },

    init() {
        this.elem.classList.add('preload');
        this.elem.innerHTML = this.text;
    }
};

preload.init();

// const videoListItems = document.querySelector('.video-list__items');

const convertISOToReadableDuration = (isoDuration) => {
    const hoursMatch = isoDuration.match(/(\d+)H/);
    const minutesMatch = isoDuration.match(/(\d+)M/);
    const secondsMatch = isoDuration.match(/(\d+)S/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
    let result = '';
    if (hours > 0) {
        result += `${hours} ч `;
    }
    if (minutes > 0) {
        result += `${minutes} мин `;
    }
    if (seconds > 0) {
        result += `${seconds} сек`;
    }
    return result.trim();
};

const formatDate = (isoString) => {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return formatter.format(date);
}

const fetchTrendingVideos = async () => {
    try {
        const url = new URL(VIDEOS_URL);
        url.searchParams.append('part', 'contentDetails,id,snippet');
        url.searchParams.append('chart', 'mostPopular');
        url.searchParams.append('regionCode', 'RU');
        url.searchParams.append('maxResults', 12);
        url.searchParams.append('key', API_KEY);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        } return response.json();
    } catch (error) {
        console.error(error);
    }
};

const fetchFavoriteVideos = async () => {
    try {
        if (favoriteIds.lenght === 0) {
            return { items: [] };
        }
        const url = new URL(VIDEOS_URL);
        url.searchParams.append('part', 'contentDetails,id,snippet');
        url.searchParams.append('maxResults', 12);
        url.searchParams.append('id', favoriteIds.join(','));
        url.searchParams.append('key', API_KEY);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        } return response.json();
    } catch (error) {
        console.error(error);
    }
};

const fetchVideoData = async (id) => {
    try {
        const url = new URL(VIDEOS_URL);
        url.searchParams.append('part', 'snippet,statistics');
        url.searchParams.append('id', id);
        url.searchParams.append('key', API_KEY);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        } return response.json();
    } catch (error) {
        console.error(error);
    }
};

const fetchSearchVideos = async (searchQuery, page) => {
    try {
        const url = new URL(SEARCH_URL);
        url.searchParams.append('part', 'snippet');
        url.searchParams.append('q', searchQuery);
        url.searchParams.append('type', 'video');
        url.searchParams.append('key', API_KEY);
        if (page) {
            url.searchParams.append('pageToken', page);
        };

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        } return response.json();
    } catch (error) {
        console.error(error);
    }
};

const createListVideo = (videos, titleText, pagination) => {
    const videoListSection = document.createElement('section');
    videoListSection.classList.add('video-list');
    const container = document.createElement('div');
    container.classList.add('container');
    const title = document.createElement('h2');
    title.classList.add('video-list__title');
    title.textContent = titleText;

    const videoListItems = document.createElement('ul');
    videoListItems.classList.add('video-list__items');

    const listVideos = videos.items.map(video => {
        const li = document.createElement('li');
        li.classList.add('video-list__item');
        li.innerHTML = `
        <article class="video-card video-list__card">
            <a href="#/video/${video.id.videoId || video.id}" class="video-card__link">
                <img class="video-card__thumbnail" src="${video.snippet.thumbnails.standard?.url
            || video.snippet.thumbnails.high?.url
            }"
                    alt="превью видео ${video.snippet.title}">
                <h3 class="video-card__title">${video.snippet.title}</h3>
                <p class="video-card__channel">${video.snippet.channelTitle}</p>
                ${video.contentDetails
                ? `<p class="video-card__duration">${convertISOToReadableDuration(
                    video.contentDetails.duration)
                }</p>
                ` : ''} 
            </a>
             <button class="video-card__favorite favorite ${favoriteIds.includes(video.id.videoId || video.id)
                ? 'active'
                : ''
            }" type="button"
                    aria-label="Добавить в избранное ${video.snippet.title}"
                    data-video-id='${video.id.videoId || video.id}'>
                <svg class="video-card__icon">
                    <use class="star-o" xlink:href="/image/sprite.svg#star-ob"></use>
                    <use class="star" xlink:href="/image/sprite.svg#star"></use>
                </svg>
            </button>
        </article>
        `;
        return li;
    })
    videoListItems.append(...listVideos);

    container.append(title, videoListItems)
    videoListSection.append(container);

    if (pagination) {
        const paginationElem = document.createElement('div');
        paginationElem.classList.add('pagination');

        if (pagination.prev) {
            const arrowPrev = document.createElement('a');
            arrowPrev.classList.add('pagination__arrow');
            arrowPrev.text = 'Предыдующая страница';
            arrowPrev.href = `#/search?q=${pagination.searchQuery}&page=${pagination.prev}`;
            paginationElem.append(arrowPrev);
        };

        if (pagination.next) {
            const arrowNext = document.createElement('a');
            arrowNext.classList.add('pagination__arrow');
            arrowNext.text = 'Следующая страница';
            arrowNext.href = `#/search?q=${pagination.searchQuery}&page=${pagination.next}`;
            paginationElem.append(arrowNext);
        };

        videoListSection.append(paginationElem);
    };


    return videoListSection;
};

const createVideo = (video) => {
    const videoSection = document.createElement('section');
    videoSection.classList.add('video');
    videoSection.innerHTML = `
    <div class="container">
        <div class="video__player">
            <iframe class="video__iframe" src="https://www.youtube.com/embed/${video.id}" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>
        </div>
        <div class="video__container">
            <div class="video__content">
                <h2 class="video__title">${video.snippet.title}</h2>
                <p class="video__channel">${video.snippet.channelTitle}</p>
                <p class="video__info">
                    <span class="video__views">${parseInt(
        video.statistics.viewCount).toLocaleString()} просмотр</span>
                    <span class="video__date">Дата премьеры: ${formatDate(
            video.snippet.publishedAt
        )}</span>
                </p>
                <p class="video__description">${video.snippet.description.replace('/n', '<br />')}</p>
            </div>
            <button class="video__link favorite ${favoriteIds.includes(video.id) ? 'active' : ''
        }" href="#/favorite">
                <span class="video__favorite">В избранном</span>
                <span class="video__no-favorite">Добавить в избранное</span>
                <svg class="video__icon">
                    <use xlink:href="/image/sprite.svg#star-ob" />
                </svg>
            </button>
        </div>
    </div>    
    `;
    return videoSection;
};

const createHero = () => {
    const heroSection = document.createElement('section');
    heroSection.className = 'hero';
    heroSection.innerHTML = `
        <div class="container">
            <div class="hero__container">
                <a href="#/favorite" class="hero__link">
                    <span class="hero__link-text">Избранное</span>
                    <svg class="hero__icon">
                        <use xlink:href="/image/sprite.svg#star-ow" />
                    </svg>
                </a>
                <svg class="hero__logo" aria-label="Логотип сервиса You-Tvideo">
                    <use xlink:href="/image/sprite.svg#logo-white"></use>
                </svg>
                <h1 class="hero__title">Смотри. Загружай. Создавай</h1>
                <p class="hero__tagline">Удобный видеохостинг для тебя</p>
            </div>
        </div>
    `;
    return heroSection;
};

const createSearch = () => {
    const searchSection = document.createElement('section');
    searchSection.className = 'search';
    const container = document.createElement('div');
    container.className = 'container';
    const title = document.createElement('h2');
    title.className = 'visually-hidden';
    title.textContent = 'Поиск';
    const form = document.createElement('form');
    form.className = 'search__form';
    form.innerHTML = `
        <input type="search" class="search__input" name="search"
        placeholder="Найти видео..." required>
        <button class="search__btn" type="submit">
            <span>поиск </span>
            <svg class="search__icon">
                <use xlink:href="/image/sprite.svg#search" />
            </svg>
        </button>    
    `;
    container.append(title, form);
    searchSection.append(container);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.search.value.trim()) {
            router.navigate(`/search?q=${form.search.value}`);
        };

    })
    return searchSection;
};

const createHeader = () => {
    const header = document.querySelector('header');
    if (header) {
        return header;
    };

    const headerElem = document.createElement('header');
    headerElem.classList.add('header');
    headerElem.innerHTML = `
        <div class="container header__container">
            <a href="#" class="header__link">
                <svg class="header__logo" aria-label="Логотип сервиса You-Tvideo">
                    <use xlink:href="/image/sprite.svg#logo-orange" />
                </svg>
            </a>
            <a href="#/favorite" class="header__link header__link_favorite">
                <span class="header__link-text">Избранное</span>
                <svg class="header__icon">
                    <use xlink:href="/image/sprite.svg#star-ob" />
                </svg>
            </a>
        </div>
    `;
    return headerElem;
};

const indexRoute = async () => {
    document.querySelector('header')?.remove();
    main.textContent = '';
    preload.append();
    const hero = createHero();
    const search = createSearch();
    const videos = await fetchTrendingVideos();
    preload.remove();
    const listVideo = createListVideo(videos, 'В тренде');
    main.append(hero, search, listVideo);
};

const videoRoute = async (ctx) => {
    const id = ctx.data.id;
    main.textContent = '';
    preload.append();

    document.body.prepend(createHeader());
    const search = createSearch();
    const data = await fetchVideoData(id);
    const video = data.items[0];
    preload.remove();
    const videoSection = createVideo(video);
    main.append(search, videoSection);

    const searchQuery = video.snippet.title;
    const videos = await fetchSearchVideos(searchQuery);
    const listVideo = createListVideo(videos, 'Похожие видео');
    main.append(listVideo);
};

const favoriteRoute = async () => {
    document.body.prepend(createHeader());
    main.textContent = '';
    preload.append();
    const search = createSearch();
    const videos = await fetchFavoriteVideos();
    preload.remove();
    const listVideo = createListVideo(videos, 'Избранное');
    main.append(search, listVideo);
};

const searchRoute = async (ctx) => {
    const searchQuery = ctx.params.q;
    const page = ctx.params.page;

    if (searchQuery) {
        document.body.prepend(createHeader());
        main.textContent = '';
        preload.append();
        const search = createSearch();
        const videos = await fetchSearchVideos(searchQuery, page);
        preload.remove();
        const listVideo = createListVideo(videos, 'Избранное', {
            searchQuery,
            next: videos.nextPageToken,
            prev: videos.prevPageToken,
        });

        main.append(search, listVideo);
    }
};

const init = () => {
    router.on({
        '/': indexRoute,
        '/video/:id': videoRoute,
        '/favorite': favoriteRoute,
        '/search': searchRoute,
    })
        .resolve();

    document.body.addEventListener('click', ({ target }) => {
        const itemFavorite = target.closest('.favorite');

        if (itemFavorite) {
            const videoId = itemFavorite.dataset.videoId;
            if (favoriteIds.includes(videoId)) {
                favoriteIds.splice(favoriteIds.indexOf(videoId), 1);
                localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds));
                itemFavorite.classList.remove('active');
            } else {
                favoriteIds.push(videoId);
                localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds));
                itemFavorite.classList.add('active');
            }
        } else {

        }
    })
};

init();