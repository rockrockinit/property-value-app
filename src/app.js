if(!window.console || !window.console.log){
  window.console = {
    log: function(){}
  };
}

var address = '',
  key = 'AIzaSyCgBlKQ2oOXmsmhqybpXpmf1_5aPbHGIFw',
  interval = undefined,
  interval_count = 0,
  rprAvmWidgetOptions = {
    Token: "C9C86DE9-67C2-47F0-B925-5126AE875D7E",
    CoBrandCode: "btsrekrealty",
    ShowRprLinks: false
  };

function loadWidget(){
  if(!isEmpty(address)){
    console.log('Loading Widget...');
    
    rprAvmWidgetOptions.Query = address;
    
    var options = rprAvmWidgetOptions,
      widgetId = 'rprAvmWidget_1';
    
    function getWidgetHtml(){
      $.ajax({
        type: 'GET',
        url: '//www.narrpr.com/widgets/avm-widget/widget.ashx/html',
        processData: true,
        data: {
          Token: options.Token,
          Query: options.Query,
          cbcode: options.CoBrandCode,
          ShowRprLinks: options.ShowRprLinks
        },
        contentType: 'application/json; charset=utf-8',
        dataType: 'jsonp',
        jsonpCallback: 'onJSONPSuccess_' + widgetId,
        cache: true,
        success: onSuccess,
        error: onError
      });
      
      function onSuccess(result){
        processWidgetResult(result);
        $('<img />').attr('src', '//www.narrpr.com/widgets/avm-widget/tracking-beacon.gif?Token='+encodeURIComponent(options.Token)+'&Entity='+encodeURIComponent(result.entityName)+'&t='+(new Date()).getTime());
      }
      
      function onError(request, status, error){
        processWidgetResult({
          status: 100,
          statusText: 'JSONP request failure'
        });
      }
      
      function processWidgetResult(result){
        var $widget = $('#'+widgetId);
        
        if(result.status === 0){
          $widget.html(result.html);
        }else{
          $widget.hide();
        }
      }
    }
    
    getWidgetHtml();
  }
}

function step(step){
  if(!isEmpty(step)){
    
    $('html, body').animate({scrollTop:0}, 'normal', function(){});
    
    $('.step').hide();
    
    // STEP 1
    if(step === 1){
      $('.step:eq(0)').show();
      
    // STEP 2
    }else if(step === 2){
      $('.step:eq(1)').show();
      $('.btn-step2').prop('disabled', false);
      
      var width = 640,
        height = 400,
        src = 'https://maps.googleapis.com/maps/api/streetview?size='+width+'x'+height+'&location='+address+'&fov=90&pitch=10&key='+key;
      
      $('.streetview').html('<img src="'+src+'" width="'+width+'" height="'+height+'" class="img-responsive" style="display:inline" />');
      $('.address').html(address);
      $('#address').val(address);
    
    // STEP 3
    }else if(step === 3){
      $('.chart').html('');
      $('.chart-1').html($('.tmpl-loading').html());
      
      $('.step:eq(2)').show();
      
      loadWidget();
      
      interval_count = 0;
      
      interval = setInterval(function(){
        console.log('Checking Widget...');
        
        if($('.chart-2').html() === ''){
          $('.chart-1').html($('div#rprAvmWidget_1 .rprw-content-1').html());
          $('.chart-2').html($('div#rprAvmWidget_1 .rprw-content-2').html());
        }
        
        if($('.chart-2').html() !== ''){
          clearInterval(interval);
        }
        
        if(interval_count >= 15){
          alert('Error\n\nUnable to pull live report at this moment.\nPlease try at a later time.');
          clearInterval(interval);
        }
        
        interval_count++;
      }, 1000);
    }
  }
}

$(function(){
  // STEP 1
  $('.btn-search').on('click', function(e){
    var $form = $(this).closest('form'),
      errors = [],
      form = $form.serializeObject();
      
    if(isEmpty(form.address)){
      errors.push('Please select an address.');
    }
    
    if(errors.length){
      alert('Error\n\n'+errors.join('\n'));
    }else{
      address = form.address;
      step(2);
    }
  });
  
  // STEP 2
  $('.btn-step2').on('click', function(e){
    var $form = $(this).closest('form'),
      errors = [],
      form = $form.serializeObject();
      
    if(isEmpty(form.name)){
      $('[name="name"]', $form).addClass('error');
      errors.push('Please enter your name.');
    }
    
    if(isEmpty(form.email)){
      $('[name="email"]', $form).addClass('error');
      errors.push('Please enter your email.');
    }else if(!isValidEmail(form.email)){
      $('[name="email"]', $form).addClass('error');
      errors.push('Please enter a valid email address.');
    }
    
    if(isEmpty(form.phone)){
      $('[name="phone"]', $form).addClass('error');
      errors.push('Please enter your phone.');
    }else if(!/\s*\(?\d{3}\)?\s*-?\s*\d{3}\s*-?\s*\d{4}\s*/.test(form.phone)){
      $('[name="phone"]', $form).addClass('error');
      errors.push('Please enter a phone # formatted like 111-111-1111');
    }
    
    if(isEmpty(form.reason)){
      $('[name="reason"]', $form).addClass('error');
      errors.push('Please select a reason.');
    }
    
    if(errors.length){
      alert('Error\n\n'+errors.join('\n'));
    }else{
      $('.btn-step2').prop('disabled', true);
      
      form.action = 'email';
      form.address = address;
      
      console.log(form);
      
      if(isEmpty(location.host) || /edrodriguez\.com$/.test(location.host)){
        step(3);
      }else{
        $.ajax({
          url: '/api.php',
          method: 'post',
          dataType: 'json',
          data: form,
          success: function(res){
            
            console.log(res);
            
            $('.btn-step2').prop('disabled', false);
            if(typeof res === 'object' && !isEmpty(res.success)){
              console.log('Success: Email sent!');
              step(3);
            }else{
              console.log('Error: Email not sent!');
              alert('Error\n\n'+'Unable to submit at this time!');
            }
          }
        });
      }
    }
  });
  
  $('input, select').on('focus', function(e){
    $(this).removeClass('error');
  });
  
  step(1);
});
