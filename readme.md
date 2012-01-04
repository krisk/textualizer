Textualizer is a jQuery plug-in that allows you to transition through blurbs of text.  When transitioning to a new blurb, any character that is common to the next blurb is kept on the screen, and moved to its new position.

See it in action: http://krisk.github.com/textualizer/

Usage
-----

Example 1 - Simplest usage with paragraph nodes inside a container

	var txtlizer = $('#container');
	txtlizer.textualizer();
	txtlizer.textualizer('start');	

Example 2 - Simple usage

	var list = ['This should provide'
		, 'A lovely rendering experience'
		, 'Try me out!'];

	var txtlizer = $('#container');
	txtlizer.textualizer(list);
	txtlizer.textualizer('start');	
	
Example 3 - Change options
	
	var list = ['This should provide'
		, 'A lovely rendering experience'
		, 'Try me out!'];

	var txtlizer = $('#container');
	txtlizer.textualizer(list, {
		effect: 'fadeIn'
		interval: 4000
	});
	txtlizer.textualizer('start');	
	
Example 4 - Initialize with data, and then change the data

	var list = ['This should provide'
		, 'A lovely rendering experience' 
		, 'Try me out!'];

	var txtlizer = $('#container');
	txtlizer.textualizer(list);
	txtlizer.textualizer('start');
	
	list = ['A whole', 'new list'];
	txtlizer.textualizer('data', list);
	txtlizer.textualizer('start');
