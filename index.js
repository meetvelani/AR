let slideIndex = 1;
    showSlides(slideIndex);

    function plusSlides(n) {
      showSlides(slideIndex += n);
    }

    function currentSlide(n) {
      showSlides(slideIndex = n);
    }

    function showSlides(n) {
      let i;
      let slides = document.getElementsByClassName("mySlides");
      let dots = document.getElementsByClassName("demo");
      let captionText = document.getElementById("caption");
      if (n > slides.length) { slideIndex = 1 }
      if (n < 1) { slideIndex = slides.length }
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
      }
      slides[slideIndex - 1].style.display = "block";
      dots[slideIndex - 1].className += " active";
      captionText.innerHTML = dots[slideIndex - 1].alt;
    }

    $(function () {
        $("#carousel-multiple").on("slide.bs.carousel", function (e) {
          var itemsPerSlide = parseInt($(this).attr('data-maximum-items-per-slide')),
            totalItems = $(".carousel-item", this).length,
            reserve = 1,//do not change
            $itemsContainer = $(".carousel-inner", this),
            it = (itemsPerSlide + reserve) - (totalItems - e.to);
      
          if (it > 0) {
            for (var i = 0; i < it; i++) {
              $(".carousel-item", this)
                .eq(e.direction == "left" ? i : 0)
                // append slides to the end/beginning
                .appendTo($itemsContainer);
            }
          }
        });
      });
      
  