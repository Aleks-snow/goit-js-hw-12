import './css/styles.css';
import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;
let loadedHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  query = form.querySelector('input[name="search-text"]').value.trim();
  if (!query) {
    iziToast.warning({ message: 'Enter a search query!', position: 'topRight' });
    return;
  }

  page = 1;
  loadedHits = 0;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        message: 'No images found. Try another query.',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);
    loadedHits += data.hits.length;

    if (loadedHits < totalHits) showLoadMoreButton();
  } catch (err) {
    console.error(err);
    iziToast.error({ message: 'Error loading images.', position: 'topRight' });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);
    loadedHits += data.hits.length;

    smoothScroll();

    if (loadedHits >= totalHits) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }
  } catch (err) {
    console.error(err);
    iziToast.error({ message: 'Unable to load more.', position: 'topRight' });
  } finally {
    hideLoader();
  }
});

function smoothScroll() {
  const card = document.querySelector('.gallery-item');
  if (card) {
    const { height } = card.getBoundingClientRect();
    window.scrollBy({ top: height * 2, behavior: 'smooth' });
  }
}