/*!
* Textualizer v1.0
*
* Dependencies:
* - jQuery
*
* Copyright 2011, Kirollos Risk
* Dual licensed under the MIT or GPL Version 2 licenses.
*
* Date: March 17, 2011
*/
(function ($) {
    $(document).ready(function () {
        // Custom effects
        var effects = {
            none: function (item) {
                this.container.append(item.node);
            }
            , fadeIn: function (item) {
                this.container.append(item.node.fadeIn(1000))
            }
            , slideLeft: function (item) {
                item.node
                    .appendTo(this.container)
                    .css({ 'left': -1000 })
                    .animate({ 'left': item.pos.left }, 1000);
            }
            , slideTop: function (item) {
                item.node
                    .appendTo(this.container)
                    .css({ 'top': -1000 })
                    .animate({ 'top': item.pos.top }, 1000);
            }
        }

        var effectList = [];
        for (var f in effects) {
            if (effects.hasOwnProperty(f)) {
                effectList.push(f);
            }
        }

        var blurb = function () {
            this.str;
            this.chars = [];
            this.get = function (c) {
                for (var i = 0, len = this.chars.length; i < len; i++) {
                    var l = this.chars[i];
                    if (l.char === c && !l.__used) {
                        l.__used = true;
                        return l;
                    }
                }
                return null;
            };
            this.reset = function () {
                $.each(this.chars, function (index, char) {
                    char.__inserted = false;
                    char.__used = false;
                });
            }
        }

        var Textualizer = function (element, data, options) {
            this.options = options;

            this.container = $('<div />')
                .css('position', 'relative')
                .appendTo(element);

            this.phantomContainer = $('<div />')
                .css({ 'position': 'relative', 'visibility': 'hidden' })
                .appendTo(element.clone().appendTo(document.body))

            this.previous;

            this.data(data);
        }

        Textualizer.prototype = {
            data: function (d) {
                this.stop();
                this.list = d;
                this.blurbs = [];
            }
            , start: function () {
                if (!this.list && this.list.length === 0) {
                    return;
                }

                var index = 0,
                    self = this,
                    rearrangeDelay = self.options.rearrangeDuration + 200,
                    appearDelay = rearrangeDelay + 500,
                    interval = this.options.interval + rearrangeDelay + appearDelay;

                // Begin iterating through the list of texts to display
                this.rotate(index++);
                this.intervalId = setInterval(function () {
                    if (index >= self.list.length) {
                        index = 0;
                        $.each(self.blurbs, function (i, item) {
                            item.reset();
                        });
                        self.rotate(index);
                    } else {
                        self.rotate(index);
                    }
                    index++;
                }, interval);
            }
            , stop: function () {
                clearInterval(this.intervalId);
            }
            , rotate: function (index) {
                var current = this.blurbs[index];

                // If this is the first time the text is encountered, each character in the text is wrapped in
                // a span and appended to an invisible container where the positioning is calculated.
                if (!current) {
                    current = new blurb();
                    current.str = this.list[index];
                    this.blurbs.push(current);

                    var stubList = [];

                    // Add all chars first to the phantom container.  Let the browser deal with the formatting.
                    $.each(current.str, $.proxy(function (index, char) {
                        if (char === '') {
                            this.phantomContainer.append(' ');
                        } else {
                            var node = $('<span/>').text(char);
                            this.phantomContainer.append(node);
                            stubList.push({ char: char, node: node });
                        }
                    }, this));

                    // Figure out positioning, and clone the text
                    $.each(stubList, function (index, stub) {
                        var pos = stub.node.position();
                        var l = stub.node.clone();

                        l.css({ 'left': pos.left, 'top': pos.top, 'position': 'absolute' });
                        current.chars.push({ char: stub.char, node: l, pos: pos })
                    });

                    this.phantomContainer.html('');
                }

                if (this.previous) {
                    // For every character in the previous text, check if it exists in the curret text.
                    // YES ==> keep the character in the DOM
                    // NO ==> remove the character from the DOM
                    var keepList = [];
                    $.each(this.previous.chars, $.proxy(function (index, prevC) {
                        var currC = current.get(prevC.char);
                        if (currC) {
                            currC.node = prevC.node;
                            keepList.push({ node: currC.node, pos: currC.pos });
                            currC.__inserted = true;
                        } else {
                            prevC.node.fadeOut('slow', function () {
                                $(this).remove();
                            });
                        }
                    }, this));
					
					// TODO: Let's figure out a proper, mathematically logical delay in between
					// re-arranging the characters that need to be kept in view, to showing all the other
					// characters. 
                    var self = this,
                        rearrangeDelay = self.options.rearrangeDuration + 200,
                        appearDelay = self.options.rearrangeDuration;//rearrangeDelay + 500;

                    // Arrange the characters
                    setTimeout(function () {
                        // Move charactes that already exist to their proper position
                        $.each(keepList, function (index, item) {
                            item.node.animate({ 'left': item.pos.left, 'top': item.pos.top }, self.options.rearrangeDuration);
                        });
                        // Show all the other characters
                        setTimeout(function () {
                            methods.showChars.call(self, current);
                        }, appearDelay);
                    }, rearrangeDelay);
                } else {
                    methods.showChars.call(this, current);
                }
                this.previous = current;
            }
        }

        var methods = {
            showChars: function (item) {
                var self = this;
                var effect = this.options.effect === 'random' ?
                    effects[effectList[Math.floor(Math.random() * effectList.length)]] :
                    effects[this.options.effect];

                for (var i = 0; i < item.chars.length; i++) {
                    var c = item.chars[i];
                    if (!c.__inserted) {
                        (function (item) {
                            setTimeout(function () {
                                item.node.css({ 'left': item.pos.left, 'top': item.pos.top });
                                effect.call(self, item);
                            }, Math.random() * 500);
                        })(c);
                    }
                }
            }
        }

        $.fn.textualizer = function (/*data, options*/) {
            var args = arguments;

            function get(ele) {
                var txtlzr = ele.data('textualizer');
                if (!txtlzr) {
                    var data = [],
                        options;

                    if (args.length === 1 && args[0] instanceof Array) {
                        data = args[0];
                    } else if (args.length === 1 && typeof args[0] === 'object') {
                        options = args[0];
                    } else if (args.length === 2) {
                        data = args[0];
                        options = args[1];
                    }

                    options = $.extend({}, $.fn.textualizer.defaults, options);
                    txtlzr = new Textualizer(ele, data, options);
                    ele.data('textualizer', txtlzr);
                }
                return txtlzr;
            }

            var txtlzr = get(this);

            if (typeof args[0] === 'string' && txtlzr[args[0]]) {
                txtlzr[args[0]].apply(txtlzr, Array.prototype.slice.call(args, 1));
            }

            return this;
        }

        $.fn.textualizer.defaults = {
            effect: 'random',
            interval: 4000,
            rearrangeDuration: 800
        };
    });
})(jQuery);