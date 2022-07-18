import { sendData } from './api.js';
import { resetFilters } from './filter.js';
import { showErrorMessage } from './form-message.js';
import { resetMap } from './map.js';
import { resetSlider } from './slider.js';

const adForm = document.querySelector('.ad-form');

const pristine = new Pristine(adForm, {
  classTo: 'ad-form__element',
  errorTextParent: 'ad-form__element',
  errorTextClass: 'ad-form__error-text'
},);

const adRooms = adForm.querySelector('#room_number');
const adCapacity = adForm.querySelector('#capacity');
const roomsCapacityOption = {
  '1': ['1'],
  '2': ['2', '1'],
  '3': ['3', '2', '1'],
  '100': ['0']
};

const resetButton = document.querySelector('.ad-form__reset');
const address = adForm.querySelector('#address');
const priceRoom = adForm.querySelector('#price');
const typeRoom = adForm.querySelector('#type');
const typesRoom = adForm.querySelectorAll('#type');
const minPriceRoom = {
  bungalow: '0',
  flat: '1000',
  hotel: '3000',
  house: '5000',
  palace: '10000'
};

const timeIn = adForm.querySelector('#timein');
const timeOut = adForm.querySelector('#timeout');
const submitButton = adForm.querySelector('.ad-form__submit');
const timeFieldSet = adForm.querySelector('.ad-form__element--time');

const validateRoomsCapacity = () => roomsCapacityOption[adRooms.value].includes(adCapacity.value);

const getRoomsCountErrorMessage = () => {
  switch (adRooms.value) {
    case '1':
      return '1 комната для 1 гостя' ;
    case '2':
      return '2 комнаты для 2 гостей или 1 гостя';
    case '3':
      return '3 комнаты для 3 гостей, 2 гостей или 1 гостя';
    case '100':
    default:
      return 'Не для гостей';
  }
};

adCapacity.addEventListener('change', () => {
  pristine.validate(adRooms);
});

pristine.addValidator(adRooms, validateRoomsCapacity, getRoomsCountErrorMessage);

const getMatchingPrice = (value) => value.length && (parseInt(value, 10) >= minPriceRoom[typeRoom.value]);

const getPriceRoomErrorMessage = () => `Минимальная цена ${minPriceRoom[typeRoom.value]}`;

function onTypeRoomChange () {
  priceRoom.placeholder = minPriceRoom[this.value];
  pristine.validate(priceRoom);
}

typesRoom.forEach((item) => item.addEventListener('change', onTypeRoomChange));

pristine.addValidator(priceRoom, getMatchingPrice, getPriceRoomErrorMessage);

timeFieldSet.addEventListener('change', (evt) => {
  timeOut.value = evt.target.value;
  timeIn.value = evt.target.value;
});

const resetForm = () => {
  setTimeout(() => {
    address.value = '35.68622, 139.77074';
    priceRoom.value = 1000;
  }, 0);
};

resetButton.addEventListener('click', ()=> {
  resetMap();
  resetForm();
  resetSlider();
  resetFilters();
});

const blockSubmitButton = () => {
  submitButton.disabled = true;
  submitButton.textContent = 'Публикую...';
};

const unblockSubmitButton = () => {
  submitButton.disabled = false;
  submitButton.textContent = 'Опубликовать';
};

const setUserFormSubmit = (onSuccess, onFailForm) => {
  adForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const isValid = pristine.validate();
    if (isValid) {
      blockSubmitButton();
      sendData(
        () => {
          onSuccess();
          unblockSubmitButton();
          resetMap();
          adForm.reset();
          resetSlider();
          resetForm();
          resetFilters();
        },
        () => {
          showErrorMessage();
          unblockSubmitButton();
        },
        new FormData(evt.target),
      );
    } else {
      onFailForm();
    }
  });
};

export {setUserFormSubmit};
