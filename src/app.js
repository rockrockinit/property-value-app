if(!window.console || !window.console.log){
  window.console = {
    log: function(){}
  };
}

var rprAvmWidgetOptions = {
    Token: "C9C86DE9-67C2-47F0-B925-5126AE875D7E",
    CoBrandCode: "btsrekrealty",
    ShowRprLinks: false
  };

/**
 * The main application logic
 */
var App = {
  step: 1,
  width: 640,
  height: 400,
  key: 'AIzaSyCgBlKQ2oOXmsmhqybpXpmf1_5aPbHGIFw',
  interval: undefined,
  interval_count: 0,
  interval_limit: 15,
  id: 'rprAvmWidget_1',
  options: {},
  
  /**
   * Initializes the application
   */
  init: function(){
    window.onpopstate = App.handleState;
    
    $('.btn-search').on('click', App.submitSearch);
    $('#autocomplete').on('keydown', App.onEnter);
    $('.btn-step2').on('click', App.submitContact);
    
    $('input, select').on('focus', function(e){
      $(this).removeClass('error');
    });
    
    App.setStep(App.step);
  },
  
  /**
   * Loads the AVM Widget
   */
  loadWidget: function(){
    if(!isEmpty(App.address)){
      console.log('Loading Widget...');
      
      rprAvmWidgetOptions.Query = App.address;
      App.options = rprAvmWidgetOptions;
      App.getWidgetHtml();
    }
  },
  
  /**
   * Requests the widget html
   */
  getWidgetHtml: function(){
    console.log('getWidgetHtml()');
    
    $.ajax({
      type: 'GET',
      url: location.protocol+'//www.narrpr.com/widgets/avm-widget/widget.ashx/html',
      processData: true,
      data: {
        Token: App.options.Token,
        Query: App.options.Query,
        cbcode: App.options.CoBrandCode,
        ShowRprLinks: App.options.ShowRprLinks
      },
      contentType: 'application/json; charset=utf-8',
      dataType: 'jsonp',
      jsonpCallback: 'onJSONPSuccess_'+App.id,
      cache: true,
      success: App.onWidgetSuccess,
      error: App.onWidgetError
    });
  },
  
  /**
   * Handles successful widget loads
   */
  onWidgetSuccess: function(result){
    App.processWidgetResult(result);
    $('<img />').attr('src', '//www.narrpr.com/widgets/avm-widget/tracking-beacon.gif?Token='+encodeURIComponent(App.options.Token)+'&Entity='+encodeURIComponent(result.entityName)+'&t='+(new Date()).getTime());
  },
  
  /**
   * Handles widget load errors
   */
  onWidgetError: function(request, status, error){
    App.processWidgetResult({
      status: 100,
      statusText: 'JSONP request failure'
    });
  },
  
  /**
   * Processes the widget results
   */
  processWidgetResult: function(result){
    var $widget = $('#'+App.id);
    
    if(result.status === 0){
      $widget.html(result.html);
    }else{
      $widget.hide();
    }
  },
  
  /**
   *  The if the widget has loaded
   */
  checkWidget: function(){
    App.interval_count++;
    console.log('Checking Widget...');
    
    if($('.chart-2').html() === ''){
      $('.chart-1').html($('div#rprAvmWidget_1 .rprw-content-1').html());
      $('.chart-2').html($('div#rprAvmWidget_1 .rprw-content-2').html());
    }
    
    if($('.chart-2').html() !== ''){
      clearInterval(App.interval);
    }
    
    if(App.interval_count >= App.interval_limit){
      alert('Error\n\nUnable to pull live report at this moment.\nPlease try at a later time.');
      clearInterval(App.interval);
    }
  },
  
  /**
   * Sets the current step of the application
   *
   * @param integer step The step to display
   */
  setStep: function(step, skip){
    skip = (typeof(skip) === 'undefined') ? false : skip;
    
    if(!isEmpty(step)){
      App.step = step;
      
      $('html, body').animate({scrollTop:0}, 'normal', function(){});
      
      $('.step').hide();
      
      // STEP 1
      if(step === 1){
        if(!skip){
          App.saveHistory('#address-search');
        }
        $('.step:eq(0)').show();
        
      // STEP 2
      }else if(step === 2){
        if(!skip){
          App.saveHistory('#contact-info');
        }
        
        $('.step:eq(1)').show();
        $('.btn-step2').prop('disabled', false);
        
        var src = 'https://maps.googleapis.com/maps/api/streetview?size='+App.width+'x'+App.height+'&location='+App.address+'&fov=90&pitch=10&key='+App.key;
        
        $('.streetview').html('<img src="'+src+'" width="'+App.width+'" height="'+App.height+'" class="img-responsive" style="display:inline" />');
        $('.address').html(App.address);
        $('#address').val(App.address);
      
      // STEP 3
      }else if(step === 3){
        if(!skip){
          App.saveHistory('#property-value');
        }
        
        $('.chart').html('');
        $('.chart-1').html($('.tmpl-loading').html());
        
        $('.step:eq(2)').show();
        
        if(1){
          App.loadWidget();
          App.interval_count = 0;
          App.interval = setInterval(App.checkWidget, 1000);
        }
      }
    }
  },
  
  /**
   * Saves the application's history
   *
   * @param string hash The history hashtag
   */
  saveHistory: function(hash){
    if(history.pushState){
      history.pushState(null, null, hash);
    }else{
      location.hash = hash;
    }
  },
  
  /**
   * Submits the address search
   * 
   * @param object e The jquery event object
   */
  submitSearch: function(e){
    var $form = $(this).closest('form'),
      errors = [],
      form = $form.serializeObject();
      
    if(isEmpty(form.address)){
      errors.push('Please select an address.');
    }
    
    if(errors.length){
      alert('Error\n\n'+errors.join('\n'));
    }else{
      App.address = form.address;
      App.setStep(2);
    }
  },
  
  /**
   * Submits the address search when the "Enter" key is pressed
   * 
   * @param object e The jquery event object
   */
  onEnter: function(e){
    if(e.which === 13){
      e.preventDefault();
      $('.btn-search').trigger('click');
      return false;
    }
  },
  
  /**
   * Validates & submits the contact info form
   * 
   * @param object e The jquery event object
   */
  submitContact: function(e){
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
      form.address = App.address;
      
      console.log(form);
      
      if(isEmpty(location.host) || /(edrodriguez\.com|\.local)$/.test(location.host)){
        App.setStep(3);
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
              App.setStep(3);
            }else{
              console.log('Error: Email not sent!');
              alert('Error\n\n'+'Unable to submit at this time!');
            }
          }
        });
      }
    }
  },
  
  /**
   * Handles the application's state changes
   * 
   * @param object e The state event object
   */
  handleState: function(e){
    clearInterval(App.interval);
    
    var hash = location.hash;
    
    if(/search/i.test(hash)){
      App.setStep(1, 1);
    }else if(/contact/i.test(hash)){
      App.setStep(2, 1);
    }else if(/value/i.test(hash)){
      App.setStep(3, 1);
    }
  }
};

$(function(){
  App.init();
});
