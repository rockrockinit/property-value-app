/**
 * Prototype extensions and common functions
 *
 * @minify true
 */
RegExp.escape = function(s){
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
Array.prototype.remove = function(from, to){
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
Array.prototype.shuffle = function(){
    var o = this;
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
// An alternative option to jquery's $.inArray(value, array)
Array.prototype.inArray = function(value){
    for(var i=0; i < this.length; i++){
        if(this[i] === value){
            return true;
        }
    }
    return false;
};
String.prototype.trim = function(){return this.replace(/^\s+|\s+$/g, '');};
String.prototype.ltrim = function(){return this.replace(/^\s+/, '');};
String.prototype.rtrim = function(){return this.replace(/\s+$/, '');};
String.prototype.startsWith = function(str){return (this.match("^"+str)==str);};
String.prototype.endsWith = function(str){return (this.match(str+"$")==str);};
String.prototype.toCapitalCase = function(){
    var re = /\s/;
    var words = this.split(re);
    re = /(\S)(\S+)/;
    for(i = words.length - 1; i >= 0; i--){
        re.exec(words[i]);
        words[i] = RegExp.$1.toUpperCase() + RegExp.$2.toLowerCase();
    }
    return words.join(' ');
};
String.prototype.replaceAll = function(strTarget, strSubString){
    var strText = this;
    var intIndexOfMatch = strText.indexOf(strTarget);
     
    while(intIndexOfMatch != -1){
        strText = strText.replace( strTarget, strSubString);
        intIndexOfMatch = strText.indexOf(strTarget);
    }
    return(strText);
};

/**
 * Parses and formats a mysql formatted date string.
 *
 * @requires
 * 		- dateformat.js
 * @param string pattern The pattern to format with.
 * @return string The formatted date.
 */
String.prototype.formatDate = function(pattern){
    var date = cms.parseDate(this);
    return (date instanceof Date) ? date.format(pattern) : this.trim();
};

Date.prototype.format = function(mask, utc){
    return cms.dateFormat(this, mask, utc);
};

// CMS OBJECT
//----------------------------------------

var cms = cms || {};

(function(cms){
    
    /**
     * Determines if a number is even.
     * 
     * @param number num The number to check.
     * @return boolean True if the number is even.
     */
    cms.isEven = function(num){
        return !(num % 2);
    };
    cms.even = cms.isEven;
    
    /**
     * Determines if a number is odd.
     * 
     * @param number num The number to check.
     * @return boolean True if the number is odd.
     */
    cms.isOdd = function(num){
        return (num % 2);
    };
    cms.odd = cms.isOdd;
    
    /**
     * Formats amounts as money.
     *
     * @usage 2014-08-19 Audit
     * 		- Hotel Tracker
     * 		- Provider Lookup Tool
     * 		- Intranet Store
     * 		- Marodyne
     * 		- Surgeon Pref Cards
     * @param number mnt The amount to format.
     * @return string The money formatted amount.
     */
    cms.formatMoney = function(mnt, commas){
        // Possibly the same results as Number.toFixed(2)
        mnt -= 0;
        mnt = (Math.round(mnt*100))/100;
        mnt = (mnt == Math.floor(mnt)) ? mnt + '.00' 
                  : ( (mnt*10 == Math.floor(mnt*10)) ? 
                           mnt + '0' : mnt);
        mnt = (typeof(commas) !== 'undefined') ? cms.addCommas(mnt) : mnt;
        return mnt;
    };
    cms.money = cms.formatMoney;

    cms.dateFormat = function(){
        var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };
        
        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            var dF = cms.dateFormat;
            
            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }
            
            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("invalid date");
            
            mask = String(dF.masks[mask] || mask || dF.masks["default"]);
            
            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
            
            var	_ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a"  : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A"  : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };
            
            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();
    
    // Some common format strings
    cms.dateFormat.masks = {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    cms.dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };
    
    /**
     * Parses a date strings and returns a javascript Date object.
     *
     * @author Ed Rodriguez
     * @created 2014-08-19
     * @param string str The date string to parse.
     * @return object The Date object.
     */
    cms.parseDate = function(str){
        if(typeof str === 'string' || str instanceof String){
            str = str.trim();
            
            if(!isEmpty(str)){
                var matches = str.split(/\ +/);
                if(matches.length <= 2){
                    
                    var configs = [
                            {
                                pattern: /^\d{4}-\d{1,2}-\d{1,2}$/,
                                delimiter: /-/,
                                props: ['year', 'month', 'day']
                            },
                            {
                                pattern: /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
                                delimiter: /\//,
                                props: ['month', 'day', 'year']
                            },
                            {
                                pattern: /^\d{1,2}\/\d{2,4}$/,
                                delimiter: /\//,
                                props: ['month', 'year']
                            },
                            {
                                pattern: /^\d{2}:\d{2}(:\d{2})?$/,
                                delimiter: /\:/,
                                props: ['hour', 'minutes', 'seconds']
                            }
                        ],
                        obj = {};
                        
                    // 1) MATCHES
                    for(var h=0; h<matches.length; h++){
                        var match = matches[h];
                        
                        // 2) CONFIGS
                        for(var i=0; i<configs.length; i++){
                            var config = configs[i];
                            
                            // 3) MATCH
                            if(match.match(config.pattern)){
                                var array = match.split(config.delimiter);
                                
                                // 4) PROPS
                                for(var j=0; j<config.props.length; j++){
                                    var prop = config.props[j];
                                    if(!isEmpty(array[j])){
                                        obj[prop] = array[j];
                                    }
                                }
                            }
                        }
                    }

                    var date = new Date(),
                        jsmonth = (!isEmpty(obj.month)) ? (parseInt(obj.month.replace(/^0/, '')) - 1) : '';
                    
                    // YEAR
                    if(!isEmpty(obj.year)){
                        date.setFullYear(obj.year);
                    }
                    
                    // MONTH
                    if(!isEmpty(obj.month) && jsmonth !== ''){
                        // Bug Fix:
                        // 2015-08-31 | edr | In cases where the current day is greater than the target month's (jsmonth) max day.
                        date.setDate('1');
                        date.setMonth(jsmonth);
                    }
                    
                    // DAY
                    if(!isEmpty(obj.year) && !isEmpty(obj.month && !isEmpty(obj.day))){
                        // BUG FIX: Last Day
                        var last = new Date(obj.year, jsmonth + 1, 0),
                            lastday = last.getDate();
                        
                        if(lastday <= obj.day){
                            date.setDate(lastday);
                        }else{
                            date.setDate(obj.day);
                        }
                    }
                    
                    if(!isEmpty(obj.hour)){date.setHours(obj.hour);}
                    if(!isEmpty(obj.minutes)){date.setMinutes(obj.minutes);}
                    if(!isEmpty(obj.seconds)){date.setSeconds(obj.seconds);}
                    
                    date.setMilliseconds(0);
                    
                    return(date);
                }
            }
        }
        return '';
    };
    
    /**
     * Determines the type of variable.
     * Can be used as a more descriptive js typeof operator.
     * 
     * @usage 2014-08-19 Audit | Currently not used anywhere.
     * @param mixed v The variable to check type.
     * @return string The variable's type.
     */
    cms.getType = function(v){
        if(typeof(v) == 'object'){
            if(v === null){
                return 'null';
            }
            if(v.constructor == (new Array).constructor){
                return 'array';
            }
            if(v.constructor == (new Date).constructor){
                return 'date';
            }
            if(v.constructor == (new RegExp).constructor){
                return 'regex';
            }
            return 'object';
        }
        return typeof(v);
    };
    cms.type = cms.getType;
    
    /**
     * Adds commas to numbers.
     *
     * @usage 2014-08-19 Audit
     * 		- formatAsMoney
     * @param number|string num The number to add commas to.
     * @return string A comma seperated numerical string.
     */
    cms.addCommas = function(num){
        num = (typeof(nStr) === 'number') ? String(num) : num;
        num += '';
        x = num.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    };
    cms.commas = cms.addCommas;
    
    /**
     * Dynamically includes external js files.
     * 
     * @param string src The js file to include dynamically.
     */
    cms.include = function(src){
        var head = document.getElementsByTagName('head')[0];
        script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        head.appendChild(script);
    };
    
    var tinyWindow = null,
    tinyImageWin = null,
    tinyFieldName = null,
    tinyFileType = null;
    
    /**
     * Opens a tinymce popup image browser.
     *
     * @link http://wiki.moxiecode.com/index.php/TinyMCE:Custom_filebrowser
     * @param string value The image value.
     * @param string type The editor type.
     */
    cms.imagePopup = function(field_name, url, type, win){
        tinyWindow  = win;
        tinyFieldName = field_name;
        tinyFileType = type;
        tinyImageWin = window.open(CMS_ROOT+'tinymce/imagebrowser.php','tinyImageWindow','width=680,height=570,resizable=0,scrollbars=0,status=0,toolbar=0,location=0,menubar=0');
        tinyImageWin.focus();
    };

    cms.setFile = function(value){
        tinyWindow.document.forms[0].elements[tinyFieldName].value = value;
        if(tinyFileType == 'image'){
            if(tinyWindow.ImageDialog.getImageData){
                tinyWindow.ImageDialog.getImageData();
            }
            if(tinyWindow.ImageDialog.showPreviewImage){
                tinyWindow.ImageDialog.showPreviewImage(value);
            }
        }else if(tinyFileType == 'media'){
            tinyWindow.switchType(value);
            tinyWindow.generatePreview();
        }
        tinyImageWindow.close();
    };
    
    /**
     * Adds images to certain editors types.
     * 
     * @param string value The image value.
     * @param string type The editor type.
     */
    cms.addImage = function(value, type){
        if(type == 'tinymce'){
            value = value.replace(/\{SITE_ROOT\}/gi, SITE_ROOT);
            tinyImageWin.document.forms[0].elements[tinyFieldName].value = value;
            if(typeof(tinyFileType) != 'undefined'){
                if(tinyFileType == 'image'){
                    tinyImageWin.showPreviewImage(value);
                }else if(tinyFileType == 'media'){
                    tinyImageWin.switchType(value);
                    tinyImageWin.generatePreview();
                }
            }
            tinyFileBrowserWin.close();
        }else if(type == 'markitup'){
            $.markItUp({name: 'Picture',
                replaceWith: function(h){
                    //replaceWith:'![![Source:!:http://]!]([![Alternative text]!])!'}
                    if(value.match(/^\!/) && value.match(/\!$/)){
                        return(' '+value);
                    }
                    return(' !'+value+'!');
                }
            });
        }
    };
    
    /**
     * Adds code markitup editors.
     *
     * @usage /snippets/cms/form/file.snip
     * @param string name The image value.
     * @param string code The code to add.
     */
    cms.addCode = function(name, code){
        $.markItUp({
            name: name,
            replaceWith: function(h){
                return(code);
            }
        });
    };
    
    /**
     * Opens files in a popup window.
     *
     * @usage /snippets/cms/form/file.snip
     * @param string file The file to open.
     */
    cms.filePopup = function(file){
        if(typeof(file) === 'string'){
            window.open(file, 'File');
        }
    };
    
    /**
     * Stops an event from bubbling the DOM.
     * 
     * @param object e The event to stop.
     */
    cms.stopEvent = function(e){
        e = (!e) ? window.event : e;
        if(typeof(e) !== 'undefined'){
            var editor = $(e.target).closest('div[editor]');
            if(editor.length){
                editor.data('disabled', (e.type.match(/leave$/)) ? false : true);
            }
            e.cancelBubble = true;
            if(e.stopPropagation){
                e.stopPropagation();
            }
        }
    };
    
    /**
     * Compares two software version numbers.
     *
     * 0 if the versions are equal
     * a negative integer if v1 < v2
     * a positive integer if v1 > v2
     * NaN if either version string is in the wrong format
     * 
     * @param {string} v1 The first version to be compared.
     * @param {string} v2 The second version to be compared.
     * @param {object} [options] Optional flags that affect comparison behavior.
     * @returns {number|NaN}
     */
    cms.version = function(v1, v2, options){
        var lexicographical = options && options.lexicographical,
            zeroExtend = options && options.zeroExtend,
            v1parts = v1.split('.'),
            v2parts = v2.split('.');
            
        function isValidPart(x){
            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
        }
        
        if(typeof v1parts.every === 'function'){
            if(!v1parts.every(isValidPart) || !v2parts.every(isValidPart)){
                return NaN;
            }
        }else{
            // IE 7 & 8 SUPPORT
            var valid = true,
                array = [v1parts, v2parts];
            for(var i=0; i<array.length; i++){
                $.each(array[i], function(index, value){
                    if(!isValidPart(value)){
                        valid = false;
                    }
                });
            }
            if(!valid){
                return NaN;
            }
        }
        
        if(zeroExtend){
            while (v1parts.length < v2parts.length) v1parts.push("0");
            while (v2parts.length < v1parts.length) v2parts.push("0");
        }
        
        if(typeof v1parts.map === 'function'){
            if(!lexicographical){
                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);
            }
        }else{
            // IE 7 & 8 SUPPORT
            var array = [];
            $.each(v1parts, function(index, value){
                array.push(Number(value));
            });
            v1parts = array;
            
            array = [];
            $.each(v2parts, function(index, value){
                array.push(Number(value));
            });
            v2parts = array;
        }
        
        for(var i = 0; i < v1parts.length; ++i){
            if(v2parts.length == i){
                return 1;
            }
            
            if(v1parts[i] == v2parts[i]){
                continue;
            }else if(v1parts[i] > v2parts[i]){
                return 1;
            }else{
                return -1;
            }
        }
        
        if(v1parts.length != v2parts.length){
            return -1;
        }
        
        return 0;
    };
    
    cms.formatPhone = function(phone){
        if(!isEmpty(phone) && (typeof phone === 'string' || typeof phone === 'number')){
            phone = String(phone);
            if(phone.match(/^\d{10}$/)){
                phone = '('+phone.substr(0, 3)+') '+phone.substr(3, 3)+'-'+phone.substr(6, 4);
            }
        }
        return phone;
    };
    cms.phone = cms.formatPhone;
    
    cms.pad = function(n, width, z){
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    
    cms.escapeHtml = function(text){
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    };
    
    /**
     * Clones Objects
     *
     * @requires JSON
     * @param object obj The object to clone
     * @return object The cloned object
     */
    cms.clone = function(obj){
        if(JSON){
            obj = JSON.stringify(obj);
            obj = JSON.parse(obj);
        }
        return obj;
    };
    
    cms.cropString = function(str, max, elipses){
        if(typeof str === 'string' && typeof max === 'number' && max > 0){
            var length = str.length;
            
            if(length > max){
                str = str.substring(0, max-1);
                
                if(typeof elipses !== 'undefined'){
                    str = str + '...';
                }
            }
        }
        
        return str;
    };
    cms.crop = cms.cropString;
    
    cms.pagination = function(page, total, records, show, showTotal){
        var html = $('<ul class="cms-pagination">');
        
        page = parseInt(page, 10);
        total = parseInt(total, 10);
        records = parseInt(records, 10);
        show = (typeof show === 'number' && show > 0) ? show : 5;
        
        if(total > 1){
            var previous = page - 1,
                next = page + 1,
                start = Math.floor((page - 1) / show);
                
            start = (start > 0) ? (start * show) : 0;
            
            var rewind = (start + 1) - show,
                forward = (start + 1) + show;
            
            if(previous > 0){
                if(rewind > 0){
                    html.append('<li><a href="javascript:void(0)" data-page="'+rewind+'" data-skip="1" title="Rewind">&laquo;</a></li>');
                }
                html.append('<li><a href="javascript:void(0)" data-page="'+previous+'" title="Previous">Prev</a></li>');
            }
            
            for(var i=start; i<(start+show); i++){
                var pagenum = i + 1,
                    current = '';
                    
                if(pagenum == page){
                    current = " class='current'";
                }
                if(total >= pagenum){
                    html.append('<li><a href="javascript:void(0)" data-page="'+pagenum+'" title="'+pagenum+'"'+current+'>'+pagenum+'</a></li>');
                }
            }
            
            if(next <= total){
                html.append('<li><a href="javascript:void(0)" data-page="'+next+'" title="Next">Next</a></li>');
                if(forward < total){
                    html.append('<li><a href="javascript:void(0)" data-page="'+forward+'" data-skip="'+total+'" title="Forward">&raquo;</a></li>');
                }
            }
            
            if(typeof showTotal !== 'undefined'){
                html.append('<li>Total '+records+'</li>');
            }
        }
        
        return html.outerHTML();
    };
    
    cms.prepHtml = function(response){
        var elem = document.createElement('div'),
            body = document.createDocumentFragment(),
            head = document.createDocumentFragment();
            
        elem.innerHTML = ($.browser.msie) ? '<span style="display:none">&nbsp;</span>'+response : response;
        
        while(elem.firstChild){
            var node = elem.firstChild,
                tagname = (typeof node.tagName === 'string') ? node.tagName : '';
            
            if(tagname.match(/script|link/i)){
                head.appendChild(node);
            }else{
                body.appendChild(node);
            }
        }
        
        var enabled = [],
            disabled = [],
            children = [];
            
        if(typeof head.children !== 'undefined'){
            children = head.children;
        }else if(typeof head.childNodes !== 'undefined'){
            children = head.childNodes;
        }
        
        if(children.length){
            for(var i=0; i<children.length; i++){
                var item = children[i];
                if(typeof item !== 'undefined'){
                    if(item.tagName.match(/script/i)){
                        if(typeof item.src === 'undefined' || (typeof item.src === 'string' && !item.src.match(/\/global\//i))){
                            enabled.push(item);
                        }else{
                            disabled.push(item);
                        }
                    }else if(item.tagName.match(/link/i)){
                        if(typeof item.href === 'undefined' || (typeof item.href === 'string' && !item.href.match(/\/global\//i))){
                            enabled.push(item);
                        }else{
                            disabled.push(item);
                        }
                    }
                }
            }
        }
        
        if(0){
            $.cms.log('Enabled: '+enabled.length);
            $.cms.log(enabled);
            
            $.cms.log('Disabled: '+disabled.length);
            $.cms.log(disabled);
        }
        
        return {
            head: enabled,
            body: body
        };
    };
    
    /**
     * Returns the filesize of the submitted file
     * 
     * @param integer $size The size of the file in bytes
     * @return string The size of the file in (bytes, kb, mb, or gb)
     */ 
    cms.filesize = function(size){
        if(cms.type(size) === 'number'){
            var type = ' bytes';
            if(size > 1024){
                size = size/1024;
                type = ' kb';
                size = Math.round(size);
            }
            if(size > 1024){
                size = size/1024;
                type = ' mb';
            }
            if(size > 1024){
                size = size/1024;
                type = ' gb';
            }
            size = Math.round(size);
            return size+type;
        }
        return '';
    };
    
    cms.upload = function(files, name, data, callback){
        if(window.FormData && typeof files === 'object' && typeof name !== 'undefined'){
            files = (cms.type(files) !== 'array') ? [files] : files;
            
            var msg = 'Uploading '+files.length;
            
            if(files.length === 1 ){
                msg += ' file...';
            }else{
                msg += ' files...';
            }
            
            $.cms.openModal({
                message: msg,
                aftercontent: function(){
                    var formdata = new FormData();
                    
                    if(typeof data === 'object'){
                        for(var prop in data){
                            formdata.append(prop, data[prop]);
                        }
                    }
                    
                    $.each(files, function(index, file){
                        formdata.append(name, file);
                    });
                    
                    $.ajax({
                        url: SITE_ROOT+'api/cms.files/upload/config/image/',
                        type: 'POST',
                        data: formdata,
                        processData: false,
                        contentType: false,
                        success: function(res){
                            if(typeof callback === 'function'){
                                callback.call(this, res);
                            }
                            $.cms.closeModal();
                        },      
                        error: function(xhr, status, error){
                            var res = {errors:[], successes:[]};
                            
                            res.errors.push(error);
                            
                            if(typeof callback === 'function'){
                                callback.call(this, res);
                            }
                        }    
                    });
                }
            });
        }
    };
    
    cms.getParamNames = function(fn){
        var funStr = fn.toString();
        return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
    };
    
    cms.Apps = function(){
        
        this.active = function(app){
            var apps = this,
                active = undefined;
            
            if(typeof app === 'object'){
                $.each(apps, function(index, item){
                    if(item === app){
                        item.isActive = true;
                    }else{
                        item.isActive = false;
                    }
                });
                active = app;
            }else{
                $.each(apps, function(index, app){
                    if(app.isActive){
                        active = app;
                        return false;
                    }
                    return true;
                });
            }
            
            return active;
        };
    };
    
    cms.Apps.prototype = Array.prototype;
    
    cms.apps = new cms.Apps();
})(cms);

// GLOBAL UTILITIES
//----------------------------------------

/**
 * Adds a object create function if one doesn't exist
 */
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

/**
 * Determines if a variable is empty.
 * Very useful and in the global scope so all applications can utilize it.
 * 
 * @param string s The ajax object to process.
 * @return boolean True if the variable is empty.
 */
function isEmpty(value){
    // Undefined
    if(typeof(value) === 'undefined'){
        return true;
    }
    // NULL
    if(value === null){
        return true;
    }
    // Empty String 
    if(typeof(value) === 'string' && value.trim() === ''){
        return true;
    }
    // Empty Number 
    if(typeof(value) === 'number' && (isNaN(value) || value === 0)){
        return true;
    }
    // Empty Array
    if($.isArray(value) && value.length <= 0){
        return true;
    }
    return false;
}

/**
 * Decodes url strings.
 * Very similar to php urldecode.
 * 
 * @param string str The ajax object to process.
 * @return string The decoded string.
 */
function urldecode(str){
    str = '' + str;
    while(true){
        var i = str.indexOf('+');
        if(i < 0){
            break;
        }
        str = str.substring(0, i) + '%20' + str.substring(i + 1, str.length);
    }
    return unescape(str);
}

/**
 * Determines if an object is an array.
 * 
 * @param object obj The object to check if it is an array.
 * @return boolean True if the object is an array.
 */
function isArray(obj){
    if(!obj || typeof(obj) !== 'object'){
        return false;
    }else if(obj.constructor.toString().indexOf("Array") == -1){
        return false;
    }
    return true;
}

/**
 * Uppercases words in a phrase.
 * 
 * @usage Widely Used
 * @param string str The str to word uppercase.
 * @return string A word uppercased string.
 */
function ucwords(str){
    var tmpStr, tmpChar, preString, postString, strlen;
    tmpStr = str.toLowerCase();
    stringLen = tmpStr.length;
    if(stringLen > 0){
        for(i=0; i<stringLen; i++){
            if(i === 0){
                tmpChar = tmpStr.substring(0,1).toUpperCase();
                postString = tmpStr.substring(1,stringLen);
                tmpStr = tmpChar + postString;
            }else{
                tmpChar = tmpStr.substring(i,i+1);
                if(tmpChar == ' ' && i < (stringLen-1)){
                    tmpChar = tmpStr.substring(i+1,i+2).toUpperCase();
                    preString = tmpStr.substring(0,i+1);
                    postString = tmpStr.substring(i+2,stringLen);
                    tmpStr = preString + tmpChar + postString;
                }
            }
        }
    }
    return(tmpStr);
}

/**
 * Formats amounts as money.
 *
 * @deprecated Moved to cms object.
 * @usage 2014-08-19 Audit
 * 		- Hotel Tracker
 * 		- Provider Lookup Tool
 * 		- Intranet Store
 * 		- Marodyne
 * @param number mnt The amount to format.
 * @return string The money formatted amount.
 */
function formatAsMoney(mnt, commas){
    // Possibly the same results as Number.toFixed(2)
    mnt -= 0;
    mnt = (Math.round(mnt*100))/100;
    mnt = (mnt == Math.floor(mnt)) ? mnt + '.00' 
              : ( (mnt*10 == Math.floor(mnt*10)) ? 
                       mnt + '0' : mnt);
    mnt = (typeof(commas) !== 'undefined') ? cms.addCommas(mnt) : mnt;
    return mnt;
}

/**
 * Determines if an email is valid based on its format.
 *
 * @usage Widely Used
 * @param string email The email to validate.
 * @return boolean True if the email is valid.
 */
function isValidEmail(email){
    if(typeof(email) !== 'string'){
        return false;
    }
    var at = email.lastIndexOf('@');
    
    // Make sure the at (@) sybmol exists and  
    // it is not the first or last character
    if(at < 1 || (at + 1) === email.length){
        return false;
    }
    
    // Make sure there aren't multiple periods together
    if(/(\.{2,})/.test(email)){
        return false;
    }
    
    // Break up the local and domain portions
    var local = email.substring(0, at);
    var domain = email.substring(at + 1);
    
    // Check lengths
    if(local.length < 1 || local.length > 64 || domain.length < 4 || domain.length > 255){
        return false;
    }
    
    // Make sure local and domain don't start with or end with a period
    if(/(^\.|\.$)/.test(local) || /(^\.|\.$)/.test(domain)){
        return false;
    }
    
    // Check for quoted-string addresses
    // Since almost anything is allowed in a quoted-string address,
    // we're just going to let them go through
    if(!/^"(.+)"$/.test(local)){
        // It's a dot-string address...check for valid characters
        if(!/^[\-a-zA-Z0-9!#$%*\/?|\^{}`~&'+=_\.]*$/.test(local)){
            return false;
        }
    }
    
    // Make sure domain contains only valid characters and at least one period
    if(!/^[\-a-zA-Z0-9\.]*$/.test(domain) || domain.indexOf(".") === -1){
        return false;
    }
    return true;
}

/**
 * Stops an event from bubbling the DOM.
 *
 * @deprecated Moved to cms object.
 * @param object e The event to stop.
 */
function stopEvent(e){
    e = (!e) ? window.event : e;
    if(typeof(e) !== 'undefined'){
        var editor = $(e.target).closest('div[editor]');
        if(editor.length){
            editor.data('disabled', (e.type.match(/leave$/)) ? false : true);
        }
        e.cancelBubble = true;
        if(e.stopPropagation){
            e.stopPropagation();
        }
    }
}
