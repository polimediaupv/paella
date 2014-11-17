function updateVideoContainer(baseId, index, array) {
  $('#' + baseId).css('width', $('#' + baseId + '_width').val() + 'px');
  $('#' + baseId).css('height', $('#' + baseId + '_height').val() + 'px');
  $('#' + baseId).css('top', $('#' + baseId + '_top').val() + 'px');
  $('#' + baseId).css('left', $('#' + baseId + '_left').val() + 'px');
};

function fixAspectRatioFor(baseId, changedAttribute) {
  if(changedAttribute == 'width') {
    var newWidth = $('#' + baseId + '_width').val();
    var widthRatio = $('#' + baseId + '_width').attr('step');
    var heightRatio = $('#' + baseId + '_height').attr('step');
    var newHeight = (newWidth / widthRatio) * heightRatio;
    $('#' + baseId + '_height').val(newHeight);
  } else {
    var newHeight = $('#' + baseId + '_height').val();
    var heightRatio = $('#' + baseId + '_height').attr('step');
    var widthRatio = $('#' + baseId + '_width').attr('step');
    var newWidth = (newHeight / heightRatio) * widthRatio;
    $('#' + baseId + '_width').val(newWidth);
  }
  updateLayout();
}

function updateLayout(){
  ['presenter', 'presentation'].forEach(updateVideoContainer);
};

$(function(){
  updateLayout();

  $('#presenter_top, #presenter_left, #presentation_top, #presentation_left').change(function(){
    updateLayout();
  });

  $('#presenter_width, #presenter_height, #presentation_width, #presentation_height').change(function(el){
    fixAspectRatioFor($(this).data('vid-type'), $(this).data('dimension-type'));
  });

  $('#aspect_ratio').change(function(){
    var ratios = $('#aspect_ratio').val().split(':');
    var widthRatio = ratios[0];
    var heightRatio = ratios[1];

    $('#presenter_width, #presentation_width').attr('step', widthRatio);
    $('#presenter_height, #presentation_height').attr('step', heightRatio);

  });
});
