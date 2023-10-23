const API_KEY = 'AIzaSyBRGf0v3Aa62NW4QmpjR3NbHSqVjfTHFn4';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const favoriteIds = JSON.parse(localStorage.getItem('favoriteYT') || '[]')
console.log('favoriteIds: ', favoriteIds)
const videoListItems = document.querySelector('.video-list__items');

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

const displayVideo = (videos) => {
    videoListItems.textContent = '';

    const listVideos = videos.items.map(video => {
        const li = document.createElement('li');
        li.classList.add('video-list__item');
        li.innerHTML = `
        <article class="video-card video-list__card">
            <a href="/video.html?id=${video.id}" class="video-card__link">
                <img class="video-card__thumbnail" src="${video.snippet.thumbnails.standard?.url
            || video.snippet.thumbnails.high?.url
            }"
                    alt="превью видео ${video.snippet.title}">
                <h3 class="video-card__title">${video.snippet.title}</h3>
                <p class="video-card__channel">${video.snippet.channelTitle}</p>
                <p class="video-card__duration">${convertISOToReadableDuration(video.contentDetails.duration)}</p>
            </a>
             <button class="video-card__favorite favorite ${favoriteIds.includes(video.id) ? 'active' : ''
            }" type="button"
                    aria-label="Добавить в избранное ${video.snippet.title}"
                    data-video-id='${video.id}'>
                <svg class="video-card__icon">
                    <use class="star-o" xlink:href="/image/sprite.svg#star-ob"></use>
                    <use class="star" xlink:href="/image/sprite.svg#star"></use>
                </svg>
            </button>
        </article>
        `;
        return li;
    })
    videoListItems.append(...listVideos)
};
const init = () => {
    const currentPage = location.pathname.split('/').pop();

    const urlSearchParams = new URLSearchParams(location.search);
    const videoId = urlSearchParams.get('id');
    const searchQuery = urlSearchParams.get('q');
    if (currentPage === 'index.html' || currentPage === '') {
        fetchTrendingVideos().then(displayVideo);
    } else if (currentPage === 'video.html' && videoId) {
        console.log('currentPage is video.html and videoId :', videoId)
    } else if (currentPage === 'favorite.html') {
        fetchFavoriteVideos().then(displayVideo);
    } else if (currentPage === 'search.html' && searchQuery) {
        console.log('currentPage is search:', currentPage)
    }

    console.log('currentPage: ', currentPage);


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

/*etag: "kusSmoRbxX7gr-IWIxWwf68Aj84"
items: Array(12)
0: {
    kind: 'youtube#video', 
    etag: '1oLr7LEwUZjUDgi3jsmBfyg_brw', 
    id: 'K4eWjH6SK_w', 
    snippet: {  categoryId: "22"
                channelId: "UCY43rpj2sh36KIFir6twO3Q"
                channelTitle: "Bad Company"
                description: "Смотри шоу УЛИЦА только в Vk видео!"
                liveBroadcastContent: "none"
                localized: 
                    description: "Смотри шоу УЛИЦА только в Vk видео!"
                    title: "ГЕНИАЛЬНЫЙ ПОДКАТ К ВИКЕ ОТ ВЗЛОМЩИКА КЛЮЧЕЙ #улица #подкат  #badcompany #mediumquality #складчикова"
                [[Prototype]]: Object
                publishedAt: "2023-10-22T07:11:00Z"
                tags: (18) ['плохая компания', 'улица', 'коротыши', 'medium quality', 'квн', 'игра', 'тнт', 'комики', 'юмористы', 'камеди батлл', 'ночная лига', 'каратиши', 'каротыши', 'коратыши', 'коратишы', 'скадчикова', 'коротишы', 'коротиши']
                thumbnails: default: {url: 'https://i.ytimg.com/vi/K4eWjH6SK_w/default.jpg', width: 120, height: 90}
                            high: {url: 'https://i.ytimg.com/vi/K4eWjH6SK_w/hqdefault.jpg', width: 480, height: 360}
                            maxres: {url: 'https://i.ytimg.com/vi/K4eWjH6SK_w/maxresdefault.jpg', width: 1280, height: 720}
                            medium: {url: 'https://i.ytimg.com/vi/K4eWjH6SK_w/mqdefault.jpg', width: 320, height: 180}
                            standard: {url: 'https://i.ytimg.com/vi/K4eWjH6SK_w/sddefault.jpg', width: 640, height: 480}
                            [[Prototype]]: Object
                title: "ГЕНИАЛЬНЫЙ ПОДКАТ К ВИКЕ ОТ ВЗЛОМЩИКА КЛЮЧЕЙ #улица #подкат  #badcompany #mediumquality #складчикова"
                [[Prototype]]: Object}, 
    contentDetails: {
            caption: "false"
            contentRating: {
                definition: "hd"
                dimension: "2d"
                duration: "PT44S"
                licensedContent: true
                projection: "rectangular"
                }
            definition: "hd"
            dimension: "2d"
            duration: "PT44S"
            licensedContent: true
            projection: "rectangular"
            [[Prototype]]: Object
        etag: "1oLr7LEwUZjUDgi3jsmBfyg_brw"
        id: "K4eWjH6SK_w"
        kind: "youtube#video"
    }}

kind: "youtube#videoListResponse"
nextPageToken: "CAwQAA"
pageInfo:  {totalResults: 145, resultsPerPage: 12}
*/