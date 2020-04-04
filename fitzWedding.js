console.log("connected");

var activationHeight = $(document).height() - 200;
var signatureVisible = false;

$(window).scroll(function() {   
    if($(window).scrollTop() + $(window).height() > activationHeight) {
        if (!signatureVisible) {
            $("#signature").removeClass("d-none")
                .hide()
                .fadeTo('slow','1');
            signatureVisible = true;
        } 
    } else {
        $("#signature").addClass("d-none");
        signatureVisible = false;
    }
});

// Cycle through images for story
(function() {
    "use strict";

    //** On initialisation **//

    // Array holding all the images to be loaded
    var imageList = [
        "https://images.unsplash.com/photo-1513279922550-250c2129b13a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
        "https://images.unsplash.com/photo-1490723186985-6d7672633c86?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
        "https://images.unsplash.com/photo-1501901609772-df0848060b33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
        "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80"
    ];
    var $imageContainer;
    var newIndex;

    // Add nextIndex property to array
    addArrayNextIndexSupport();

    //** Initialize on start **//
    $(function () {
        // Cache a reference to .imageContainer1
        $imageContainer = $('.imageContainer1');

        // Set default image on start
        $imageContainer.css({'background-image': 'url(' + imageList[0] + ')'});
        // preloadImage(imageList.nextIndex(0), true);

        $imageContainer
            .data('index', 0) // Set data-index to 0 on init

            newIndex = imageList.nextIndex($imageContainer.data('index'));
                swapImage(newIndex);

            // Image automatically cycles through on interval
            setInterval(function () {
                newIndex = imageList.nextIndex($imageContainer.data('index'));
                swapImage(newIndex);
            }, 2500);
    });

    function addArrayNextIndexSupport() {
        // Add nextIndex property to array
        if (!Array.prototype.nextIndex) {
            Array.prototype.nextIndex = function (currentIndex) {
                // If current index is in array add one, else set to 0
                return currentIndex < this.length - 1 ? currentIndex + 1 : 0;
            }
        }
    }

    function swapImage(newIndex) {
        var newImageSrc;
        var $image = $imageContainer.find('#imageAlbum');
        var imgIsAnimating = $image.is(':animated');

        if (!imgIsAnimating) {
            newImageSrc = imageList[newIndex];

            // Set background-image to new image
            $imageContainer.css({'background-image': 'url(' + newImageSrc + ')'});

            //Set data-index to the new index value
            $imageContainer.data('index', newIndex);

            // Fade old image
            $image.animate({ opacity: 0 }, function () {
                var $image = $imageContainer.find('#imageAlbum');
                // Change new image src
                $image.prop('src', newImageSrc);
                // Change
                $image.animate({ opacity: 1 }, "slow");
            });
        }
    }
}());
