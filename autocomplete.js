/**
 * 将html的select控件转换为具有自动补全功能的下拉列表插件
 * 用法：
 * $('#id').autoCompleteCombox({
 * 		inputClass: 'input', 
 *		listMaxHeight: 100, 
 * 		onchange: function(event, data){
 *			var value = data.value;
 *			var text = data.text;
 *	}});
 *	id:必须是html的select控件
 *  参数：
 *  inputClass：输入框的类名
 *  onchange：下拉列表选择改变时触发的事件
 *  listMaxHeight：下拉列表最大高度
 */
$.widget('ui.autoCompleteCombox', {
	_create: function() {
		//隐藏原select
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
		this.input.css({
			lineHeight: (divHeight - inputHeightPadding) + 'px'	//只对IE生效
		});
		
		//设置下三角位置
		var spanWidth = this.span.outerWidth();
		var spanHeight = this.span.outerHeight();
		
		this.span.css({
			right: spanWidth + 'px',
			top: (divHeight-spanHeight)/2 + 'px'
		});
		
		//创建下拉框
		this.ul = $('<ul>').appendTo(this.div).css({
			top: divHeight
		}).width(divWidth - 2).hide();
		
		var listMaxHeight = this.options.listMaxHeight;
		if(listMaxHeight){
			this.ul.css({maxHeight: listMaxHeight, overflowY:'auto'});
		}
		
		var _ul = this.ul;
		var _input = this.input;
		
		var optionPaddingLeft = this.element.css('padding-left');
		
		if(parseInt(optionPaddingLeft) == 0){
			optionPaddingLeft = '4px';
		}
		
		var fontSize = this.element.css('font-size');
		var fontFamily = this.element.css('font-family');
		
		this.element.children().each(function(){
			var _value = $(this).attr('value');
			var _text = $(this).text();
			var _selected = $(this).prop('selected');
			var _li = $('<li>').appendTo(_ul).data('value', _value).text(_text)
				.css({
						paddingLeft: optionPaddingLeft, 
						fontSize: fontSize,
						fontFamily: fontFamily,
						height: fontSize
					});
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
    	this._trigger("onchange", null, { value: _value, text:_text });
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
		
		var _selectedItem = _childrens.eq(_index); 
		
		this.ul.children('.selected').removeClass('selected');
		_selectedItem.addClass('selected');
		
		var _value = _selectedItem.attr('value');
		var _text = _selectedItem.text();
		
		var _position = _selectedItem.position();
		
		if(_position.top < 0){
			this.ul.scrollTop(this.ul.scrollTop() - _selectedItem.outerHeight());
		}else if(_position.top + _selectedItem.outerHeight() >= this.ul.height()){
			this.ul.scrollTop(_selectedItem.outerHeight() + this.ul.scrollTop());
		}
		
		this._onChange(_value, _text);
    },
    
    _bindEvent: function(){
    	var _self = this;
    	
    	//下三角点击事件
        this.span.on('click', function(){
    		_self._showList();
    	});
    	
    	//输入焦点捕获事件
        this.input.on('focusin', function(){
    		_self._showList();
    	});

		//输入事件
        this.input.keyup(function(event){
            //Enter上下方向键、TAB键
			if(event.which == 13 || event.which == 38 || event.which == 40 || event.which == 9){
				return;
			}

			_self.ul.children().removeClass('selected');
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

			if(_self.ul.children('.show').size() == 0){
				_self.ul.hide();
			}else{
				_self.ul.show();
			}
		});
    	
    	//lose focus 事件
        this.input.on('focusout', function(event){
            var _textInput = _self.input.val();
    		var _textSelected = _self.element.find("option:selected").text();
    		
    		if(_textInput != _textSelected){
    			alert('请选择一个列表中存在的值');
                this.focus();
                return;
    		}
            setTimeout(function(){
                _self._hideList();
            }, 100);
    	});

        //点击方向键
        this.div.on('keydown', 'ul, li, input', function(event){
    		if( ! _self.ul.is(':hidden') && (event.which == 38 || event.which == 40)){
    			_self._onArrowPress(event);
    		}
    	});
    	
    	//选中事件
        this.ul.on('click, mouseenter', 'li', function(event){
    		var _value = $(this).data('value');
    		var _text = $(this).text();
    		
    		_self._onChange(_value, _text);
    		
    		$(this).siblings('.selected').removeClass('selected');
    		$(this).addClass('selected');
    		if(event.type == 'click'){
                _self._hideList();
            }
    		return false;
    	});
    }
});