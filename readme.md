Textualizer is a jQuery plug-in that allows you to transition through blurbs of text.  When transitioning to a new blurb, any character that is common to the next blurb is kept on the screen, and moved to its new position.

See it in action: http://kiro.me/projects/textualizer.html

Usage
-----

####Paragraph nodes inside a container

```javascript
var txtlizer = $('#container');
txtlizer.textualizer();
txtlizer.textualizer('start');	
```

####Specifying a list of a blurbs

```javascript
var list = ['This should provide'
	, 'A lovely rendering experience'
	, 'Try me out!'];

var txtlizer = $('#container');
txtlizer.textualizer(list);
txtlizer.textualizer('start');	
```

####Change options

```javascript
var list = ['This should provide'
	, 'A lovely rendering experience'
	, 'Try me out!'];

var txtlizer = $('#container');
txtlizer.textualizer(list, {
	effect: 'fadeIn'
	duration: 4000
});
txtlizer.textualizer('start');	
```	

#####Options
* effect: "none" | "fadeIn" | "slideLeft" | "slideTop"
* duration
* rearrangeDuration
* centered

####Initialize with data, and then change the data

```javascript
var list = ['This should provide'
	, 'A lovely rendering experience' 
	, 'Try me out!'];

var txtlizer = $('#container');
txtlizer.textualizer(list);
txtlizer.textualizer('start');

list = ['A whole', 'new list'];
txtlizer.textualizer('data', list);
txtlizer.textualizer('start');
```