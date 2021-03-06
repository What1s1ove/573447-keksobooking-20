'use strict';

(function () {
  var constants = window.common;
  var helpers = window.helpers;
  var adFormNode = document.querySelector('.ad-form');
  var adFormFieldsetsNodes = adFormNode.querySelectorAll('fieldset');
  var adAvatarNode = adFormNode.querySelector('#avatar');
  var adAvatarImgNode = adFormNode.querySelector('.ad-form-header__preview img');
  var adAddressNode = adFormNode.querySelector('#address');
  var adTypeNode = adFormNode.querySelector('#type');
  var adPriceNode = adFormNode.querySelector('#price');
  var adTimeInNode = adFormNode.querySelector('#timein');
  var adTimeOutNode = adFormNode.querySelector('#timeout');
  var adRoomNumberNode = adFormNode.querySelector('#room_number');
  var adCapacityNode = adFormNode.querySelector('#capacity');
  var adHousingImgLoaderNode = adFormNode.querySelector('#images');
  var adHousingImgOutputNode = adFormNode.querySelector('.ad-form__photo');
  var adResetBtnNode = adFormNode.querySelector('.ad-form__reset');
  var cleanUpAdForm = null;

  var roomsToGuests = {
    '1': [1],
    '2': [1, 2],
    '3': [1, 2, 3],
    '100': [0]
  };

  var getPinCoords = function (x, y) {
    var pinCoords = x.toFixed() + ', ' + y.toFixed();

    return pinCoords;
  };

  var setAddressCoords = function (x, y) {
    var coords = getPinCoords(x, y);

    adAddressNode.value = coords;
  };

  var changeAdType = function () {
    switch (constants.offerTypesMap[adTypeNode.value]) {
      case constants.offerTypesMap.flat:
        adPriceNode.min = 1000;
        adPriceNode.placeholder = '1000';
        break;
      case constants.offerTypesMap.house:
        adPriceNode.min = 5000;
        adPriceNode.placeholder = '5000';
        break;
      case constants.offerTypesMap.palace:
        adPriceNode.min = 10000;
        adPriceNode.placeholder = '10000';
        break;
      default:
        adPriceNode.min = 0;
        adPriceNode.placeholder = '0';
    }
  };

  var changeAdTime = function (evt) {
    var timeValue = evt.target.value;

    adTimeInNode.value = timeValue;
    adTimeOutNode.value = timeValue;
  };

  var changeCapacity = function () {
    var roomGuests = roomsToGuests[adRoomNumberNode.value];
    var isAllow = roomGuests.includes(Number(adCapacityNode.value));

    adCapacityNode.setCustomValidity(
        isAllow
          ? ''
          : 'Чувак, слишком много людей для такого типа помещения... Think about it!🤔'
    );
  };

  var clearAvatar = function () {
    var defaultAvatarPath = 'img/muffin-grey.svg';

    adAvatarImgNode.src = defaultAvatarPath;
  };

  var clearHousingImg = function () {
    adHousingImgOutputNode.innerHTML = '';
  };

  var clearFormImages = function () {
    clearAvatar();
    clearHousingImg();
  };

  var outputHousingImg = function () {
    var img = document.createElement('img');

    clearHousingImg();

    helpers.setImagePreview(adHousingImgLoaderNode, img);

    adHousingImgOutputNode.append(img);
  };

  var validateFormNodes = function (isReset) {
    var nodes = Array.from(adFormNode.elements);

    nodes.forEach(function (it) {
      it.style.borderColor = ((!it.validity.valid || it.validity.customError) && !isReset) ? 'red' : '';
    });
  };

  var onFormSendSuccess = function () {
    window.modals.renderSuccess();
    window.main.toggleAppStatus(false);
  };

  var onFormSendFailure = function (message) {
    window.modals.renderError(message);
  };


  var onAdFormSubmit = function (evt) {
    var formData = new FormData(adFormNode);

    window.api.sendAd(onFormSendSuccess, onFormSendFailure, formData);

    validateFormNodes(true);

    evt.preventDefault();
  };

  var onAdFormReset = function (evt) {
    evt.preventDefault();

    adFormNode.reset();

    window.main.toggleAppStatus(false);
  };

  var onAdFormInvalid = function () {
    validateFormNodes(false);
  };

  var onAdFormChange = function (evt) {
    switch (evt.target.name) {
      case adAvatarNode.name:
        helpers.setImagePreview(adAvatarNode, adAvatarImgNode);
        break;
      case adTimeInNode.name:
      case adTimeOutNode.name:
        changeAdTime(evt);
        break;
      case adCapacityNode.name:
      case adRoomNumberNode.name:
        changeCapacity();
        break;
      case adTypeNode.name:
        changeAdType();
        break;
      case adHousingImgLoaderNode.name:
        outputHousingImg();
    }
  };

  var setAdFromListeners = function () {
    adFormNode.addEventListener('submit', onAdFormSubmit);
    adFormNode.addEventListener('change', onAdFormChange);
    adFormNode.addEventListener('invalid', onAdFormInvalid, true);
    adResetBtnNode.addEventListener('click', onAdFormReset);

    return function () {
      adFormNode.removeEventListener('submit', onAdFormSubmit);
      adFormNode.removeEventListener('change', onAdFormChange);
      adFormNode.removeEventListener('invalid', onAdFormInvalid, true);
      adResetBtnNode.removeEventListener('click', onAdFormReset);
    };
  };

  var toggleFormStatus = function (isActive) {
    adFormNode.classList.toggle('ad-form--disabled');

    helpers.toggleNodesDisabled(adFormFieldsetsNodes, !isActive);

    if (isActive) {
      cleanUpAdForm = setAdFromListeners();
    } else {
      adFormNode.reset();

      cleanUpAdForm();

      clearFormImages();

      validateFormNodes(true);
    }
  };

  var initForm = function () {
    helpers.toggleNodesDisabled(adFormFieldsetsNodes, true);
  };

  window.form = {
    init: initForm,
    toggleStatus: toggleFormStatus,
    setAddressCoords: setAddressCoords
  };
})();
