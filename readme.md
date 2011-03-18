Textualizer
-----------


	var list = ['Cultivating a close, warmhearted feeling for others is the ultimate source of success in life.'
			, 'As well as restraining ourselves from negative thoughts and emotions, we need to cultivate and reinforce our positive qualities.'
			, 'Altruism means that we should not be exclusively preoccupied with our own welfare. This does not imply that one should become a 		 martyr!'];

	var s = $('#container');
	s.textualizer(list);
	s.textualizer('start');
		
	s.textualizer('data', ['ab', 'bc', 'efdc']);
	s.textualizer('start');