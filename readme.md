Textualizer
-----------


	var list = ['This should provide'
			, 'A lovely rendering experience'
			, 'Try me out!'];

	var s = $('#container');
	s.textualizer(list);
	s.textualizer('start');
		
	s.textualizer('data', ['ab', 'bc', 'efdc']);
	s.textualizer('start');