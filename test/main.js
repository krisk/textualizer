$(function() {


  var $prevButton = $('.prv'),
      $nextButton = $('.nxt'),

      $ul = $('> ul', '.sliderGallery'),

      $items = $ul.find('> li');

      $selectedItem = $items.filter('.selected'),

      selectedIndex = 0;

      NUM_ITEMS = 26,
      viewableArea = 13,
      viewableAreaIndex = 1,

      WIDTH = 32,

      percentage = 0.80,

      RESET_SPEED = 150;

  // If there's no selected item to begin with,
  // simply select the first.
  if ($selectedItem.length === 0) {
    $selectedItem = $items.first().addClass('selected');
    selectedIndex = 0;
  }

  function scrollRight(spots, speed) {
    $ul.animate({
      left: '-=' + (spots * WIDTH)
    }, speed || 400);
  }

  function scrollLeft(spots, speed) {
    $ul.animate({
      left: '+=' + (spots * WIDTH)
    }, speed || 400);
  }

  function next() {
    selectedIndex++;
    viewableAreaIndex++;

    if (selectedIndex === NUM_ITEMS) {
      selectedIndex = 0;
      viewableAreaIndex = 1;
    }

    $selectedItem.removeClass('selected');
    $selectedItem = $items.eq(selectedIndex).addClass('selected');

    if (selectedIndex === 0) {
      scrollLeft(NUM_ITEMS - viewableArea, RESET_SPEED);
    } else {
      var viewableAreaMoveIndex = Math.ceil(viewableArea * percentage),
          viewableAreaMidPoint = Math.ceil(viewableArea / 2);

      if (viewableAreaIndex >= viewableAreaMoveIndex) {
        var viewableAreaLastItemIndex = selectedIndex + 1 + (viewableArea - viewableAreaIndex),
            moveDistance = viewableAreaIndex - viewableAreaMidPoint,
            numItemsLeft = NUM_ITEMS - viewableAreaLastItemIndex,
            distance = Math.min(moveDistance, numItemsLeft);

        if (distance > 0) {
          scrollRight(distance);
          viewableAreaIndex -= distance
        }
      }
    }

    console.log(viewableAreaIndex);
  }

  function prev() {
    selectedIndex--;
    viewableAreaIndex--;

    if (selectedIndex === -1) {
      selectedIndex = NUM_ITEMS - 1;
      viewableAreaIndex = viewableArea;
    }

    $selectedItem.removeClass('selected');
    $selectedItem = $items.eq(selectedIndex).addClass('selected');

    if (selectedIndex === NUM_ITEMS - 1) {
      scrollRight(NUM_ITEMS - viewableArea, RESET_SPEED);
    } else {
      var viewableAreaMoveIndex = Math.ceil(viewableArea * percentage),
          viewableAreaMidPoint = Math.ceil(viewableArea / 2);

      if (viewableAreaIndex <= viewableArea - viewableAreaMoveIndex + 1) {
        var viewableAreaLastItemIndex = selectedIndex - viewableAreaIndex + 2,
            moveDistance = viewableAreaMidPoint - viewableAreaIndex,
            numItemsLeft = viewableAreaLastItemIndex - 1,
            distance = Math.min(moveDistance, numItemsLeft);

        if (distance > 0) {
          scrollLeft(distance);
          viewableAreaIndex += distance
        }
      }
    }

    console.log(viewableAreaIndex);
  }

  function onPrevButtonClicked() {
    prev();
  }

  function onNextButtonClicked() {
    next();
  }

  $prevButton.on('click', onPrevButtonClicked);
  $nextButton.on('click', onNextButtonClicked);

  $(window).on('keyup', function(event) {
    if (event.which === 39) {
      onNextButtonClicked();
    } else if (event.which === 37) {
      onPrevButtonClicked();
    }
  })

});