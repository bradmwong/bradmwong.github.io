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
