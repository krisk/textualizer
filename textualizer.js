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
        /**
        * Overloads:
        * 1. textualizer(data, options)
        * 2. textualizer(data)
        * 3. textualizer(options)
        *
        * @param data: Array of texts to transition
        * @param options:
        * <effect> - name of the effect to apply: random, fadeIn, slideLeft, slideTop.
        * <interval> - Time (ms) between transitions
        * <rearrangeDuration> - Time (ms) for characters to arrange into position
        */
        $.fn.textualizer = function (data, options) {
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
                    } else {
                        throw 'textualizer: invalid argument(s)';
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
            interval: 3000,
            rearrangeDuration: 1000
        };

        var COMMON_CHARACTER_ARRANGE_DELAY = 1000,
            REMAINING_CHARACTERS_DELAY = 500,
            EFFECT_DURATION = 2000,
            REMAINING_CHARACTERS_APPEARANCE_MAX_DELAY = 2000;

        // Effects for characters transition+animation. Customize as you please
        $.fn.textualizer.effects = {
            none: function (item) {
                console.log('NONE');
                this.container.append(item.node.show());
            }
            , fadeIn: function (item) {
                this.container.append(item.node.fadeIn(EFFECT_DURATION))
            }
            , slideLeft: function (item) {
                item.node
                    .appendTo(this.container)
                    .css({ 'left': -1000 })
                    .animate({ 'left': item.pos.left }, EFFECT_DURATION);
            }
            , slideTop: function (item) {
                item.node
                    .appendTo(this.container)
                    .css({ 'top': -1000 })
                    .animate({ 'top': item.pos.top }, EFFECT_DURATION);
            }
        }

        // Copy all effects into an array ==> Makes randomization easy
        var effectList = [];
        $.each($.fn.textualizer.effects, function (key, value) {
            if (key !== 'none') {
                effectList.push(key);
            }
        });

        var Blurb = function () {
            this.str;  // The text string
            this.chars = []; // Array of char objects
        }
        Blurb.prototype = {
            // Loops through chars, and find the first char whose character matches c, and hasn't been already used.
            get: function (c) {
                for (var i = 0, len = this.chars.length; i < len; i++) {
                    var l = this.chars[i];
                    if (l.char === c && !l.used) {
                        l.used = true;  // Mark as used.  
                        return l;
                    }
                }
                return null;
            }
            // Resets ever character in chars
            , reset: function () {
                $.each(this.chars, function (index, char) {
                    char.inserted = false;
                    char.used = false;
                });
            }
        }

        var Char = function () {
            this.char = null; // A character
            this.node = null; // The span element that wraps around the character
            this.pos = null;  // The node position
            this.used = false;
            this.inserted = false;
        }

        var Textualizer = function (element, data, options) {
            this.options = options;

            // Contains transitioning text
            this.container = $('<div />')
                .css('position', 'relative')
                .appendTo(element);

            // Used for initial positioning calculation
            this.phantomContainer = $('<div />')
                .css({ 'position': 'relative', 'visibility': 'hidden' })
                .appendTo(element.clone().appendTo(document.body))

            // Holds the previous text
            this._previous = null;

            if (data && data instanceof Array) {
                this.data(data);
            }
        }

        Textualizer.prototype = {
            data: function (d) {
                this.list = d;
                this.blurbs = [];
            }
            , start: function () {
                // If there are no items, then simply exit
                if (!this.list || this.list.length === 0) {
                    return;
                }

                var self = this,
                    index = this._index || 0;

                this._pause = false;

                // Begin transitioning through the items
                function rotate(i) {
                    if (self._pause) {
                        return;
                    }
                    // _rotate returns a promise, which completes when a blurb has finished animating.  When that 
                    // promise if fulfilled, transition to the next blurb.
                    self._rotate(i)
                        .done(function () {
                            setTimeout(function () {
                                // If we've reached the last blurb, reset the position of every character in every blurb
                                if (i === self.list.length - 1) {
                                    i = -1;
                                    $.each(self.blurbs, function (j, item) {
                                        item.reset();
                                    });
                                }
                                i++;
                                self._index = i;
                                rotate(i); // rotate the next blurb
                            }, self.options.interval);
                        });
                }

                // Begin iterating through the list of blurbs to display
                rotate(index);
            }
            , pause: function () {
                this._pause = true;
            }
            , _rotate: function (index) {
                var dfd = $.Deferred(),
                    current = this.blurbs[index];

                // If this is the first time the text is encountered, each character in the text is wrapped in
                // a span and appended to an invisible container where the positioning is calculated.
                if (!current) {
                    var phantomBlurbs = [];

                    current = new Blurb();
                    current.str = this.list[index];
                    this.blurbs.push(current);

                    // Add all chars first to the phantom container. Let the browser deal with the formatting.
                    $.each(current.str, $.proxy(function (index, char) {
                        if (char === '') {
                            this.phantomContainer.append(' ');
                        } else {
                            var c = new Char();
                            c.char = char;
                            c.node = $('<span/>').text(char);

                            this.phantomContainer.append(c.node);
                            phantomBlurbs.push(c);
                        }
                    }, this));

                    // Figure out the positioning, and clone the DOM node
                    $.each(phantomBlurbs, function (index, c) {
                        c.pos = c.node.position();
                        c.node = c.node.clone();

                        c.node.css({ 'left': c.pos.left, 'top': c.pos.top, 'position': 'absolute' });
                        current.chars.push(c);
                    });

                    this.phantomContainer.html('');
                }

                if (this._previous) {
                    // For every character in the previous text, check if it exists in the current text.
                    // YES ==> keep the character in the DOM
                    // NO ==> remove the character from the DOM
                    var self = this,
                        keepList = [],
                        removeList = [],
                        dfds = [];

                    $.each(this._previous.chars, function (index, prevC) {
                        var currC = current.get(prevC.char);
                        if (currC) {
                            currC.node = prevC.node; // use the previous DOM node
                            currC.inserted = true;

                            keepList.push(currC);
                        } else {
                            var d = $.Deferred();
                            removeList.push(d);
                            prevC.node.fadeOut('slow', function () {
                                $(this).remove();
                                d.resolve();
                            });

                        }
                    });

                    // When all characters that's arent common to the blurbs have been removed...
                    $.when.apply(null, removeList).done(function () {
                        // Move charactes that are common to their new position
                        setTimeout(function () {
                            $.each(keepList, function (index, item) {
                                item.node.animate({ 'left': item.pos.left, 'top': item.pos.top }, self.options.rearrangeDuration);
                                dfds.push(item.node);
                            });
                            // When all the characters have moved to their new position, show the remaining characters
                            $.when.apply(null, dfds).done(function () {
                                setTimeout(function () {
                                    methods.showChars.call(self, current)
                                        .done(function () {
                                            dfd.resolve();
                                        });
                                }, REMAINING_CHARACTERS_DELAY);
                            });
                        }, COMMON_CHARACTER_ARRANGE_DELAY);
                    });

                } else {
                    methods.showChars.call(this, current)
                        .done(function () {
                            dfd.resolve();
                        });
                }
                this._previous = current;

                return dfd.promise();
            }
            , destroy: function () {
                this.container
                    .parent()
                        .removeData('textualizer')
                    .end()
                    .remove();
                this.phantomContainer.remove();
            }
        }

        var methods = {
            showChars: function (item) {
                var self = this,
                    effect = this.options.effect === 'random' ?
                            $.fn.textualizer.effects[effectList[Math.floor(Math.random() * effectList.length)]] :
                            $.fn.textualizer.effects[this.options.effect],
                    dfd = $.Deferred(),
                    dfds = [];

                // Iterate through all char objects
                $.each(item.chars, function (index, char) {
                    // If the character has not been already inserted, animate it, with a delay
                    if (!char.inserted) {
                        char.node
                            .show()
                            .css({ 'left': char.pos.left, 'top': char.pos.top })
                            .delay(Math.random() * REMAINING_CHARACTERS_APPEARANCE_MAX_DELAY);

                        effect.call(self, char);

                        // Push the character we animate it to deferred list.
                        dfds.push(char.node);
                    }
                });

                // When all characters have been showed, resolve the promise
                $.when.apply(null, dfds).done(function () {
                    dfd.resolve();
                });

                return dfd.promise();
            }
        }
    });
})(jQuery);