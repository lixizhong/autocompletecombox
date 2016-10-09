/**
 * 将html的select控件转换为具有自动补全功能的下拉列表插件
 * 用法：
 * $('#id').autoCompleteCombox({
 * 		inputClass: 'input', 			
 * 		onchange: function(event, data){
 *			var value = data.value;
 *			var text = data.text;
 *	}});
 *	id:必须是html的select控件
 *  参数：
 *  inputClass：输入框的类名
 *  onchange：下拉列表选择改变时触发的事件
 */
$.widget('ui.autoCompleteCombox', {
	_create: function() {
		this.element.hide();
		//创建最外层div
		this.div = $('<div>').insertBefore(this.element).addClass('comboFilter');
		
		//创建input
		this.input = $('<input>').appendTo(this.div).attr('type', 'text');
		var inputClass = this.options.inputClass;
		if(inputClass){
			this.input.addClass(inputClass);
		}
		
		//创建下三角
		this.span = $('<span>').appendTo(this.div).addClass('triangle-down');
		
		//设置div大小
		var divWidth = this.element.outerWidth();
		var divHeight = this.element.outerHeight();
		
		this.div.width(divWidth);
		this.div.height(divHeight);
		
		//设置input大小
		var inputWidthPadding = this.input.outerWidth() - this.input.width();
		var inputHeightPadding = this.input.outerHeight() - this.input.height();
		
		this.input.width(divWidth - inputWidthPadding);
		this.input.height(divHeight - inputHeightPadding);
		
		//设置下三角位置
		var spanWidth = this.span.outerWidth();
		var spanHeight = this.span.outerHeight();
		
		this.span.css({
			right: spanWidth + 'px',
			top: (divHeight-spanHeight)/2 + 'px'
		});
		
		//创建下拉框
		this.ul = $('<ul>').appendTo(this.div).css({top: divHeight}).width(divWidth-2).hide();
		var _ul = this.ul;
		var _input = this.input;
		
		var optionPaddingLeft = this.element.css('padding-left');
		var fontSize = this.element.css('font-size');
		
		this.element.children().each(function(){
			var _value = $(this).attr('value');
			var _text = $(this).text();
			var _selected = $(this).prop('selected');
			var _li = $('<li>').appendTo(_ul).attr('value', _value).text(_text).css({paddingLeft: optionPaddingLeft, fontSize: fontSize});
			if(_selected){
				_li.addClass('selected');
				_input.val(_text);
			}
		});
		
		this._bindEvent();
    },
    
    _showList: function(){
    	this.ul.children().show().addClass('show');
    	this.ul.show();
    },
    
    _hideList: function(){
    	this.ul.hide();
    	this.ul.children().show();
    },
    
    _onChange: function(_value, _text){
    	this.element.val(_value);
    	this.input.val(_text);
    	this._trigger("onchange", null, { value: _value, text:_text } )
    },
    
    _onArrowPress: function(event){
    	var _childrens = this.ul.children('.show');
		var _index = _childrens.index(this.ul.children('.selected.show'));
		
		if(event.which == 38){			//方向键向上
			_index--;
			_index = _index < 0 ? 0 : _index;
		}else if(event.which == 40){	//方向键向下
			if(_index == -1){
				_index = 0;
			}else{
				_index++;
			}
			
			var size = _childrens.size();
			_index = _index > (size - 1) ? (size - 1) : _index;
		}else{
			return;
		}
		
		this.ul.children('.selected').removeClass('selected');
		_childrens.eq(_index).addClass('selected');
		
		var _value = _childrens.eq(_index).attr('value');
		var _text = _childrens.eq(_index).text();
		
		this._onChange(_value, _text);
    },
    
    _bindEvent: function(){
    	var _self = this;
    	
    	//下三角点击事件
    	this.span.on('click', function(){
    		_self._showList();
    	});
    	
    	//输入焦点捕获事件
    	this.input.on('click', function(){
    		_self._showList();
    	});
    	
    	//lose focus 事件
    	$(document).on('click', function(event){
    		var _target = event.target;
    		if(_target == _self.div.get()[0] || _target == _self.input.get()[0] || _target == _self.span.get()[0] || _target == _self.ul.get()[0]){
    			return;
    		}
    		_self._hideList();
    	});
    	
    	$(document).on('keydown', function(event){
    		if( ! _self.ul.is(':hidden')){
    			_self._onArrowPress(event);
    		}
    	});
    	
    	//选中事件
    	this.ul.on('click', 'li', function(){
    		if($(this).hasClass('selected')){
    			return false;
    		}
    		var _value = $(this).attr('value');
    		var _text = $(this).text();

    		_self._onChange(_value, _text);
    		
    		$(this).siblings('.selected').removeClass('selected');
    		$(this).addClass('selected');
    		
    		_self._hideList();
    		return false;
    	});
    	
    	//输入事件
    	this.input.keyup(function(event){
    		
    		if(event.which == 13){
    			_self._hideList();
    			return;
    		}
    		
    		if(event.which == 38 || event.which == 40){
    			return;
    		}

    		_self._showList();
    		
    		var _text = $(this).val();
    		
    		if($.trim(_text) == ''){
    			return;
    		}
    		
    		var _regx = new RegExp(".*"+_text+".*","ig");

    		_self.ul.children().each(function(){
    			var _litext = $(this).text();
    			if( ! _regx.test(_litext)){
    				$(this).hide().removeClass('show');
    			}
    		});
    	});
    }
	
});