var defaultErrorMessage = 'There was an error.';

const errors = {
	stdError: function(res, errMsg, code) {
		return res.status(500).json({errMsg: errMsg || defaultErrorMessage, code: code });
	}, 
	dbError: function(res, err, errMsg, code){
		return res.status(500).json({errMsg: errMsg || defaultErrorMessage, code: code });
	},
	requiredPropError:function(res, missingProp) {
		return res.status(400).json({errMsg: (missingProp) ? 'Missing required property: ' + missingProp : 'Missing required property.'});
	},
	noResultsError: function(res, errMsg){
		return res.status(400).json({errMsg: (errMsg) ? errMsg : 'No Results Found.'});
	}
};


module.exports = exports = errors;