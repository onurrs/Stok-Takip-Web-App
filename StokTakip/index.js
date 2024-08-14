$(document).ready(function(){
    
    $("#seachInput").on("keyup",function(){
        var value = $(this).val().toLowerCase();

        $("#main *").filter(function(){

            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);

        })
        
    })

    $(".navbar a").on('click', function(event){

        if (this.hash !== ""){

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            })

        }

    })
    
})