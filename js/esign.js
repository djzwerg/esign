/**
 * @file
 * Supporting file for the esign module.
 */

(function ($) {
  Drupal.behaviors.esign = {
    attach: function (context, settings) {
      activateEsign();
    },
    detach: function (context, settings) {
      activateEsign();
    }
  };

  $(document).ready(function () {
    activateEsign();
  });

  function activateEsign() {
    $('.esign_container').each(function () {
      var thisContainer = $(this);
      var settings = JSON.parse($(this).attr('data-settings'));
      var signatureCapture;
      var canvas;
      var signaturePad;

      // Assign the hidden field (that saves the signature) to a variable.
      signatureCapture = thisContainer.find('.signature-storage');

      // Set the canvas to a variable.
      canvas = thisContainer.find('canvas')[0];

      // Instantiate the signaturepad itself.
      settings.onEnd = function () {
        // When a signature is done being signed, set the hidden field to contain the data.
        signatureCapture.val(signaturePad.toDataURL(settings.toDataURL));

        // Also set the data-signature value.
        thisContainer.find('.esign_panel').attr("data-signature", signaturePad.toDataURL(settings.toDataURL));
        thisContainer.find('.signature-created').val(Math.ceil(Date.now() / 1000));
      };
      signaturePad = new SignaturePad(canvas, settings);

      // Add the "clear" button.
      thisContainer.find('.esign_panel .clear-container').remove();
      thisContainer.find('.esign_panel').append('<div class="clear-container"><br/><a href="#" class="clear">Clear</a></div>');

      // Make the clear button work.
      thisContainer.find('.esign_panel .clear').click(function (e) {
        e.preventDefault();
        javascript:signaturePad.clear();
        signatureCapture.val("");
        thisContainer.find('.esign_panel').attr('data-signature', '');
        resizeCanvas(canvas, signaturePad, signatureCapture, settings);
      });

      // Call the "resize" function for high-DPI screens.
      resizeCanvas(canvas, signaturePad, signatureCapture, settings);

      $(window).on('orientationchange', function () {
        resizeCanvas(canvas, signaturePad, signatureCapture, settings);
      });
    });
  }

  function resizeCanvas(canvas, signaturePad, signatureCapture, settings) {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    if (!signaturePad.isEmpty()) {
      signatureCapture.val(signaturePad.toDataURL(settings.toDataURL));
    }
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    if (signatureCapture.val()) {
      signaturePad.fromDataURL(decodeURIComponent(signatureCapture.val()));
    }
  }

  $(window).resize(function () {
    // resizeCanvas(canvas, signaturePad, signatureCapture)
  });

})(jQuery);
